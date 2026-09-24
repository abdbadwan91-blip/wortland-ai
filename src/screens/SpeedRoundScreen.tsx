import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../modules/Auth/AppContext';
import {
  buildSession,
  getSpeedTimerSec,
  type SpeedRoundQuestion,
} from '../modules/FlashArena/speedRound';
import { getLevelParams } from '../modules/Content/levelDifficulty';
import { speakGerman, stopSpeech, warmSpeechVoices } from '../modules/Audio/speech';
import { recordResult } from '../modules/Mastery';
import type { LearningObject } from '../modules/Content/types';
import styles from './SpeedRoundScreen.module.css';

type CardState = 'idle' | 'correct' | 'wrong' | 'dim';

interface Props {
  onFinish: (correct: number, sessionXp: number) => void;
}

export function SpeedRoundScreen({ onFinish }: Props) {
  const { t, setScreen, selectedTopic, selectedLevel } = useApp();
  const levelParams = useMemo(() => getLevelParams(selectedLevel), [selectedLevel]);
  const timerSec = useMemo(() => getSpeedTimerSec(selectedLevel), [selectedLevel]);
  const questions = useMemo(
    () => buildSession(levelParams.roundSize, selectedTopic, selectedLevel),
    [selectedTopic, selectedLevel, levelParams.roundSize],
  );
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<'ok' | 'retry' | 'hint' | null>(null);
  const [locked, setLocked] = useState(false);
  const [cardStates, setCardStates] = useState<Record<string, CardState>>({});
  const [imageError, setImageError] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [timerLeft, setTimerLeft] = useState(timerSec);
  const advancing = useRef(false);
  const failsRef = useRef(0);
  const softTimedOut = useRef(false);

  const q: SpeedRoundQuestion = questions[index];
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
    setTimerLeft(timerSec);
  }, [index, q, timerSec]);

  useEffect(() => {
    if (!q || locked || advancing.current) return;
    if (timerLeft <= 0) return;
    const id = window.setTimeout(() => {
      setTimerLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearTimeout(id);
  }, [timerLeft, q, locked]);

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

  /** Soft miss + reveal + advance (used on timeout and 2nd fail). */
  const gentleMissAndAdvance = useCallback(() => {
    if (!q || advancing.current) return;
    setLocked(true);
    advancing.current = true;
    setStreak(0);
    setFeedback('hint');
    setCardStates(() => {
      const next: Record<string, CardState> = {};
      for (const o of q.options) {
        next[o.id] = o.id === q.target.id ? 'correct' : 'dim';
      }
      return next;
    });
    window.setTimeout(() => goNext(correctCount, sessionXp), 1100);
  }, [q, goNext, correctCount, sessionXp]);

  // Strict timer expiry → gentle miss feedback, then advance
  useEffect(() => {
    if (timerLeft !== 0 || softTimedOut.current || !q) return;
    if (locked || advancing.current) return;
    softTimedOut.current = true;
    setFeedback('retry');
    gentleMissAndAdvance();
  }, [timerLeft, q, locked, gentleMissAndAdvance]);

  const onPick = (opt: LearningObject) => {
    if (locked || advancing.current || !q) return;
    const isCorrect = opt.id === q.target.id;
    recordResult(selectedTopic, q.target.id, isCorrect);

    if (isCorrect) {
      setLocked(true);
      advancing.current = true;
      const nextCorrect = correctCount + 1;
      const nextStreak = streak + 1;
      const streakBonus = nextStreak >= 3 ? 2 : nextStreak >= 2 ? 1 : 0;
      const gained = 5 + streakBonus;
      const nextXp = sessionXp + gained;
      setCorrectCount(nextCorrect);
      setSessionXp(nextXp);
      setStreak(nextStreak);
      setFeedback('ok');
      const nextStates: Record<string, CardState> = {};
      for (const o of q.options) {
        nextStates[o.id] = o.id === opt.id ? 'correct' : 'dim';
      }
      setCardStates(nextStates);
      window.setTimeout(() => goNext(nextCorrect, nextXp), 550);
      return;
    }

    const nextFails = failsRef.current + 1;
    failsRef.current = nextFails;
    setStreak(0);
    setCardStates((prev) => ({ ...prev, [opt.id]: 'wrong' }));

    if (nextFails >= 2) {
      gentleMissAndAdvance();
    } else {
      setFeedback('retry');
      window.setTimeout(() => {
        setCardStates((prev) => {
          const next = { ...prev };
          if (next[opt.id] === 'wrong') delete next[opt.id];
          return next;
        });
      }, 400);
    }
  };

  if (!q) return null;

  const pct = (index / total) * 100;
  const showUrl = q.target.imageKind === 'url' && !imageError;

  return (
    <div className={`screen fade-in ${styles.wrap}`} data-speed-round>
      <div className={styles.topBar}>
        <button
          type="button"
          className="back-chip"
          onClick={() => {
            stopSpeech();
            setScreen('gameModes');
          }}
        >
          ← {t('sr.back')}
        </button>
        <div className={styles.chips}>
          {streak >= 2 && (
            <span className={styles.streakChip} dir="ltr" data-streak>
              🔥 {streak}
            </span>
          )}
          <span className={styles.xpChip} dir="ltr">⭐ +{sessionXp}</span>
        </div>
      </div>

      <div className={styles.progress}>
        <span className={styles.progressLabel}>
          {t('sr.progress', { current: index + 1, total })}
        </span>
        <div className={styles.track} aria-hidden>
          <div className={styles.fill} style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div
        className={`${styles.strictTimer} ${timerLeft <= 3 ? styles.strictTimerLow : ''}`}
        data-speed-timer
        data-soft-timer
        aria-live="polite"
      >
        ⏱️ {timerLeft}s
      </div>

      <div className={styles.promptCard}>
        <p className={styles.promptLabel}>{t('sr.prompt')}</p>
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
            <span className={styles.imageFallback} aria-hidden>⚡</span>
          )}
        </div>
        <div className={styles.audioRow}>
          <button
            type="button"
            className={`${styles.speaker} ${speaking ? styles.pulse : ''}`}
            onClick={() => play('normal')}
            aria-label={t('sr.speak')}
            data-speak
          >
            🔊
          </button>
          <button
            type="button"
            className={styles.slowBtn}
            onClick={() => play('slow')}
            aria-label={t('sr.slow')}
            title={t('sr.slow')}
            data-slow
          >
            🐢
          </button>
        </div>
        {feedback === 'hint' && (
          <p className={styles.lemmaHint}>
            {t('sr.hint', { word: q.target.lemma })}
          </p>
        )}
      </div>

      <div
        className={styles.options}
        role="listbox"
        aria-label={t('sr.pick')}
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
              aria-label={opt.lemma}
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
          <span className={styles.feedbackOk}>{t('sr.correct')}</span>
        )}
        {feedback === 'retry' && (
          <span className={styles.feedbackRetry}>{t('sr.tryAgain')}</span>
        )}
        {feedback === 'hint' && (
          <span className={styles.feedbackHint}>
            {t('sr.hint', { word: q.target.lemma })}
          </span>
        )}
      </div>

      <div className={styles.spacer} />
    </div>
  );
}
