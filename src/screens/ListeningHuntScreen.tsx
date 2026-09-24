import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../modules/Auth/AppContext';
import {
  buildSession,
  type ListeningHuntQuestion,
} from '../modules/FlashArena/listeningHunt';
import { getLevelParams } from '../modules/Content/levelDifficulty';
import { speakGerman, stopSpeech, warmSpeechVoices } from '../modules/Audio/speech';
import { SpeechSpeedChip } from '../components/SpeechSpeedChip';
import { recordResult } from '../modules/Mastery';
import type { LearningObject } from '../modules/Content/types';
import styles from './ListeningHuntScreen.module.css';

type CardState = 'idle' | 'correct' | 'wrong' | 'dim';

const FALLBACK_EMOJI: Record<string, string> = {
  katze: '🐱', hund: '🐶', fisch: '🐟', vogel: '🐦', pferd: '🐴',
  kuh: '🐮', schaf: '🐑', schwein: '🐷', hase: '🐰', maus: '🐭',
  elefant: '🐘', loewe: '🦁', baer: '🐻', affe: '🐵', ente: '🦆',
  huhn: '🐔', frosch: '🐸', schlange: '🐍', schildkroete: '🐢', biene: '🐝',
  apfel: '🍎', banane: '🍌', brot: '🍞', milch: '🥛', kaese: '🧀',
  ei: '🥚', wasser: '💧', saft: '🧃', reis: '🍚', nudeln: '🍝',
  suppe: '🍲', salat: '🥗', tomate: '🍅', karotte: '🥕', kartoffel: '🥔',
  eis: '🍦', kuchen: '🍰', schokolade: '🍫', pizza: '🍕', orange: '🍊',
};

interface Props {
  onFinish: (correct: number, sessionXp: number) => void;
}

export function ListeningHuntScreen({ onFinish }: Props) {
  const { t, setScreen, selectedTopic, selectedLevel } = useApp();
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
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [speaking, setSpeaking] = useState(false);
  const [timerLeft, setTimerLeft] = useState<number | null>(null);
  const advancing = useRef(false);
  const failsRef = useRef(0);
  const softTimedOut = useRef(false);

  const q: ListeningHuntQuestion = questions[index];
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

  // Auto-play German on each new question — listening only (no lemma text)
  useEffect(() => {
    if (!q) return;
    failsRef.current = 0;
    softTimedOut.current = false;
    setFeedback(null);
    setLocked(false);
    setCardStates({});
    setImageErrors({});
    advancing.current = false;
    setTimerLeft(levelParams.timerSec);
    const timer = window.setTimeout(() => play(levelParams.audioRate), 350);
    return () => window.clearTimeout(timer);
  }, [index, q, play, levelParams.timerSec, levelParams.audioRate]);

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
    recordResult(selectedTopic, q.target.id, isCorrect);

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

  return (
    <div className={`screen fade-in ${styles.wrap}`} data-listening-hunt>
      <div className={styles.topBar}>
        
        <SpeechSpeedChip />
<button
          type="button"
          className="back-chip"
          onClick={() => {
            stopSpeech();
            setScreen('gameModes');
          }}
        >
          ← {t('lh.back')}
        </button>
        <span className={styles.xpChip} dir="ltr">⭐ +{sessionXp}</span>
      </div>

      <div className={styles.progress}>
        <span className={styles.progressLabel}>
          {t('lh.progress', { current: index + 1, total })}
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

      <div className={styles.promptCard} data-audio-prompt>
        <p className={styles.promptLabel}>{t('lh.listen')}</p>
        <div className={styles.audioCol}>
          <div className={styles.audioRow}>
            <button
              type="button"
              className={`${styles.speaker} ${speaking ? styles.pulse : ''}`}
              onClick={() => play('normal')}
              aria-label={t('lh.speak')}
              data-speak
            >
              🔊
            </button>
            <button
              type="button"
              className={styles.slowBtn}
              onClick={() => play('slow')}
              aria-label={t('lh.slow')}
              title={t('lh.slow')}
              data-slow
            >
              🐢
            </button>
          </div>
          <button
            type="button"
            className={styles.replayBtn}
            onClick={() => play(levelParams.audioRate)}
            aria-label={t('lh.replay')}
            data-replay
          >
            🔁 {t('lh.replay')}
          </button>
        </div>
        {feedback === 'hint' && (
          <p className={styles.lemmaHint}>
            {t('lh.hint', { word: q.target.lemma })}
          </p>
        )}
      </div>

      <div
        className={styles.grid}
        role="listbox"
        aria-label={t('lh.pick')}
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
              className={`${styles.card} ${st !== 'idle' ? styles[st] : ''}`}
              onClick={() => onPick(opt)}
              data-option={opt.id}
              data-correct={opt.id === q.target.id ? '1' : '0'}
              aria-label={opt.lemma}
            >
              {opt.imageKind === 'url' && !imageErrors[opt.id] ? (
                <span className={styles.imageFrame}>
                  <img
                    className={styles.image}
                    src={opt.image}
                    alt=""
                    onError={() =>
                      setImageErrors((prev) => ({ ...prev, [opt.id]: true }))
                    }
                  />
                </span>
              ) : (
                <span className={styles.emoji} aria-hidden>
                  {opt.imageKind === 'emoji'
                    ? opt.image
                    : FALLBACK_EMOJI[opt.id] ?? '🐾'}
                </span>
              )}
              {st === 'correct' && (
                <span className={styles.checkMark} aria-hidden>
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className={styles.feedback} role="status" aria-live="polite">
        {feedback === 'ok' && (
          <span className={styles.feedbackOk}>{t('lh.correct')}</span>
        )}
        {feedback === 'retry' && (
          <span className={styles.feedbackRetry}>{t('lh.tryAgain')}</span>
        )}
        {feedback === 'hint' && (
          <span className={styles.feedbackHint}>
            {t('lh.hint', { word: q.target.lemma })}
          </span>
        )}
      </div>

      <div className={styles.spacer} />
    </div>
  );
}
