import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../modules/Auth/AppContext';
import {
  SMART_TOPIC_ID,
  buildSession,
  type QuickPickQuestion,
} from '../modules/FlashArena/quickPick';
import { getLevelParams } from '../modules/Content/levelDifficulty';
import { speakGerman, stopSpeech, warmSpeechVoices } from '../modules/Audio/speech';
import { SpeechSpeedChip } from '../components/SpeechSpeedChip';
import { recordResult } from '../modules/Mastery';
import type { LearningObject } from '../modules/Content/types';
import styles from './QuickPickScreen.module.css';

type CardState = 'idle' | 'correct' | 'wrong' | 'dim';

interface Props {
  onFinish: (correct: number, sessionXp: number) => void;
}

export function QuickPickScreen({ onFinish }: Props) {
  const { t, setScreen, selectedTopic, selectedLevel } = useApp();
  const isSmart = selectedTopic === SMART_TOPIC_ID;
  const levelParams = useMemo(() => getLevelParams(selectedLevel), [selectedLevel]);
  const questions = useMemo(
    () => buildSession(levelParams.roundSize, selectedTopic, selectedLevel),
    [selectedTopic, selectedLevel, levelParams.roundSize],
  );
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [feedback, setFeedback] = useState<'ok' | 'retry' | 'hint' | null>(null);
  const [locked, setLocked] = useState(false);
  const [cardStates, setCardStates] = useState<Record<string, CardState>>({});
  const [imageError, setImageError] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [timerLeft, setTimerLeft] = useState<number | null>(null);
  const advancing = useRef(false);
  const failsRef = useRef(0);
  const softTimedOut = useRef(false);

  const q: QuickPickQuestion = questions[index];
  const total = questions.length;

  const play = useCallback(
    (rate: 'normal' | 'slow' = 'normal') => {
      if (!q) return;
      setSpeaking(true);
      speakGerman(q.target.lemma, rate);
      window.setTimeout(() => setSpeaking(false), rate === 'slow' ? 1800 : 1100);
    },
    [q],
  );

  useEffect(() => {
    warmSpeechVoices();
    return () => stopSpeech();
  }, []);

  useEffect(() => {
    if (!q) return;
    failsRef.current = 0;
    softTimedOut.current = false;
    setFeedback(null);
    setLocked(false);
    setCardStates({});
    setImageError(false);
    advancing.current = false;
    setTimerLeft(levelParams.timerSec);
  }, [index, q, levelParams.timerSec]);

  useEffect(() => {
    if (!q || levelParams.timerSec == null || locked || advancing.current) return;
    if (timerLeft == null || timerLeft <= 0) return;
    const id = window.setTimeout(() => {
      setTimerLeft((prev) => (prev == null ? prev : Math.max(0, prev - 1)));
    }, 1000);
    return () => window.clearTimeout(id);
  }, [timerLeft, q, levelParams.timerSec, locked]);

  const goNext = useCallback(
    (nextCorrect: number, nextXp: number) => {
      if (index + 1 >= total) {
        onFinish(nextCorrect, nextXp);
      } else {
        setIndex((i) => i + 1);
      }
    },
    [index, total, onFinish],
  );

  const applyGentleMiss = useCallback(() => {
    if (!q || locked || advancing.current) return;
    const nextFails = failsRef.current + 1;
    failsRef.current = nextFails;
    setFeedback('retry');
    if (nextFails >= 2) {
      setLocked(true);
      advancing.current = true;
      setFeedback('hint');
      setCardStates((prev) => {
        const next = { ...prev };
        for (const o of q.options) {
          if (o.id === q.target.id) next[o.id] = 'correct';
          else next[o.id] = 'dim';
        }
        return next;
      });
      window.setTimeout(() => goNext(correctCount, sessionXp), 1400);
    }
  }, [q, locked, goNext, correctCount, sessionXp]);

  useEffect(() => {
    if (timerLeft !== 0 || softTimedOut.current || !q) return;
    if (locked || advancing.current) return;
    softTimedOut.current = true;
    applyGentleMiss();
  }, [timerLeft, q, locked, applyGentleMiss]);

  const onPick = (opt: LearningObject) => {
    if (locked || advancing.current || !q) return;
    const isCorrect = opt.id === q.target.id;
    recordResult(q.topicId || selectedTopic, q.target.id, isCorrect);

    if (isCorrect) {
      setLocked(true);
      advancing.current = true;
      const nextCorrect = correctCount + 1;
      const gained = 5;
      const nextXp = sessionXp + gained;
      setCorrectCount(nextCorrect);
      setSessionXp(nextXp);
      setFeedback('ok');
      const nextStates: Record<string, CardState> = {};
      for (const o of q.options) {
        nextStates[o.id] = o.id === opt.id ? 'correct' : 'dim';
      }
      setCardStates(nextStates);
      window.setTimeout(() => goNext(nextCorrect, nextXp), 750);
      return;
    }

    const nextFails = failsRef.current + 1;
    failsRef.current = nextFails;
    setCardStates((prev) => ({ ...prev, [opt.id]: 'wrong' }));

    if (nextFails >= 2) {
      setLocked(true);
      advancing.current = true;
      setFeedback('hint');
      setCardStates((prev) => {
        const next = { ...prev };
        for (const o of q.options) {
          if (o.id === q.target.id) next[o.id] = 'correct';
          else if (o.id !== opt.id) next[o.id] = 'dim';
        }
        return next;
      });
      window.setTimeout(() => goNext(correctCount, sessionXp), 1400);
    } else {
      setFeedback('retry');
      window.setTimeout(() => {
        setCardStates((prev) => {
          const next = { ...prev };
          if (next[opt.id] === 'wrong') delete next[opt.id];
          return next;
        });
      }, 500);
    }
  };

  if (!q) return null;

  const pct = (index / total) * 100;
  const showUrl = q.target.imageKind === 'url' && !imageError;

  return (
    <div
      className={`screen fade-in ${styles.wrap}`}
      data-quick-pick
      data-smart-training={isSmart ? '1' : undefined}
    >
      <div className={styles.topBar}>
        
        <SpeechSpeedChip />
<button
          type="button"
          className="back-chip"
          aria-label={t('a11y.back')}
          onClick={() => {
            stopSpeech();
            setScreen(isSmart ? 'home' : 'gameModes');
          }}
        >
          ← {t('qp.back')}
        </button>
        <span className={styles.xpChip} dir="ltr">⭐ +{sessionXp}</span>
      </div>

      <div className={styles.progress}>
        <span className={styles.progressLabel}>
          {t('qp.progress', { current: index + 1, total })}
        </span>
        <div className={styles.track} aria-hidden>
          <div className={styles.fill} style={{ width: `${pct}%` }} />
        </div>
      </div>

      {levelParams.timerSec != null && timerLeft != null && (
        <div
          className={`${styles.softTimer} ${timerLeft <= 3 ? styles.softTimerLow : ''}`}
          data-soft-timer
          aria-live="polite"
        >
          ⏱️ {timerLeft}s
        </div>
      )}

      <div className={styles.promptCard}>
        <p className={styles.promptLabel}>{t('qp.prompt')}</p>
        <div className={styles.imageFrame}>
          {showUrl ? (
            <img
              className={styles.image}
              src={q.target.image}
              alt=""
              onError={() => setImageError(true)}
              data-target-image
            />
          ) : (
            <span className={styles.imageFallback} aria-hidden>🐾</span>
          )}
        </div>
        <div className={styles.audioRow}>
          <button
            type="button"
            className={`${styles.speaker} ${speaking ? styles.pulse : ''}`}
            onClick={() => play('normal')}
            aria-label={t('a11y.speak')}
            data-speak
          >
            🔊
          </button>
          <button
            type="button"
            className={styles.slowBtn}
            onClick={() => play('slow')}
            aria-label={t('a11y.replay')}
            title={t('qp.slow')}
            data-slow
          >
            🐢
          </button>
        </div>
        {feedback === 'hint' && (
          <p className={styles.lemmaHint}>
            {t('qp.hint', { word: q.target.lemma })}
          </p>
        )}
      </div>

      <div
        className={styles.options}
        role="listbox"
        aria-label={t('qp.pick')}
        data-options={q.options.length}
      >
        {q.options.map((opt) => {
          const st = cardStates[opt.id] ?? 'idle';
          return (
            <button
              key={opt.id}
              type="button"
              role="option"
              disabled={locked && st !== 'correct'}
              className={`${styles.option} ${st !== 'idle' ? styles[st] : ''}`}
              onClick={() => onPick(opt)}
              data-option={opt.id}
              data-correct={opt.id === q.target.id ? '1' : '0'}
              aria-label={t('a11y.wordOption', { word: opt.lemma })}
            >
              <span className={styles.lemma} dir="ltr" lang="de">
                {opt.lemma}
              </span>
              {st === 'correct' && (
                <span className={styles.checkMark} aria-hidden>✓</span>
              )}
            </button>
          );
        })}
      </div>

      <div className={styles.feedback} role="status" aria-live="polite">
        {feedback === 'ok' && (
          <span className={styles.feedbackOk}>{t('qp.correct')}</span>
        )}
        {feedback === 'retry' && (
          <span className={styles.feedbackRetry}>{t('qp.tryAgain')}</span>
        )}
        {feedback === 'hint' && (
          <span className={styles.feedbackHint}>
            {t('qp.hint', { word: q.target.lemma })}
          </span>
        )}
      </div>

      <div className={styles.spacer} />
    </div>
  );
}
