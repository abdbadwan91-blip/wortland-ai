import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../modules/Auth/AppContext';
import {
  buildMasterSession,
  type MasterQuestion,
} from '../modules/FlashArena/masterChallenge';
import { recordResult } from '../modules/Mastery';
import { speakGerman, stopSpeech, warmSpeechVoices } from '../modules/Audio/speech';
import { SpeechSpeedChip } from '../components/SpeechSpeedChip';
import { MASTER_ROUND_SIZE } from '../modules/Rewards/rewards';
import type { Article, LearningObject } from '../modules/Content/types';
import styles from './MasterChallengeScreen.module.css';

type CardState = 'idle' | 'correct' | 'wrong' | 'dim';

const FALLBACK_EMOJI: Record<string, string> = {
  katze: '🐱', hund: '🐶', fisch: '🐟', vogel: '🐦', pferd: '🐴',
  kuh: '🐮', schaf: '🐑', schwein: '🐷', hase: '🐰', maus: '🐭',
  elefant: '🐘', loewe: '🦁', baer: '🐻', affe: '🐵', ente: '🦆',
  huhn: '🐔', frosch: '🐸', schlange: '🐍', schildkroete: '🐢', biene: '🐝',
  apfel: '🍎', banane: '🍌', brot: '🍞', milch: '🥛', kaese: '🧀',
  ei: '🥚', wasser: '💧', saft: '🧃', reis: '🍚', nudeln: '🍝',
};

/** Soft per-correct XP ~1.5× the usual 5 */
const XP_PER_HIT = 8;

interface Props {
  onFinish: (correct: number, sessionXp: number) => void;
}

function formatElapsed(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

export function MasterChallengeScreen({ onFinish }: Props) {
  const { t, setScreen, selectedTopic } = useApp();
  const questions = useMemo(
    () => buildMasterSession(MASTER_ROUND_SIZE, selectedTopic),
    [selectedTopic],
  );
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [fails, setFails] = useState(0);
  const [feedback, setFeedback] = useState<'ok' | 'retry' | 'hint' | null>(null);
  const [locked, setLocked] = useState(false);
  const [cardStates, setCardStates] = useState<Record<string, CardState>>({});
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [imageError, setImageError] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [pickedArticle, setPickedArticle] = useState<Article | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const advancing = useRef(false);
  const startedAt = useRef(Date.now());

  const q: MasterQuestion | undefined = questions[index];
  const total = questions.length;

  useEffect(() => {
    const id = window.setInterval(() => {
      setElapsedMs(Date.now() - startedAt.current);
    }, 500);
    return () => window.clearInterval(id);
  }, []);

  const speakTarget = useCallback(
    (rate: 'normal' | 'slow' = 'normal') => {
      if (!q) return;
      const phrase =
        q.kind === 'article'
          ? `${q.target.article} ${q.target.lemma}`
          : q.target.lemma;
      setSpeaking(true);
      speakGerman(phrase, rate);
      window.setTimeout(() => setSpeaking(false), rate === 'slow' ? 2000 : 1200);
    },
    [q],
  );

  useEffect(() => {
    warmSpeechVoices();
    return () => stopSpeech();
  }, []);

  useEffect(() => {
    if (!q) return;
    setFails(0);
    setFeedback(null);
    setLocked(false);
    setCardStates({});
    setImageErrors({});
    setImageError(false);
    setPickedArticle(null);
    advancing.current = false;
    if (q.kind === 'picture') {
      const timer = window.setTimeout(() => speakTarget('normal'), 350);
      return () => window.clearTimeout(timer);
    }
  }, [index, q, speakTarget]);

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

  const markCorrect = useCallback(
    (key: string, optionKeys: string[]) => {
      setLocked(true);
      advancing.current = true;
      const nextCorrect = correctCount + 1;
      const nextXp = sessionXp + XP_PER_HIT;
      setCorrectCount(nextCorrect);
      setSessionXp(nextXp);
      setFeedback('ok');
      const nextStates: Record<string, CardState> = {};
      for (const k of optionKeys) {
        nextStates[k] = k === key ? 'correct' : 'dim';
      }
      setCardStates(nextStates);
      speakTarget('normal');
      window.setTimeout(() => goNext(nextCorrect, nextXp), 800);
    },
    [correctCount, sessionXp, goNext, speakTarget],
  );

  const markSoftMiss = useCallback(
    (wrongKey: string, correctKey: string, optionKeys: string[]) => {
      const nextFails = fails + 1;
      setFails(nextFails);
      setCardStates((prev) => ({ ...prev, [wrongKey]: 'wrong' }));

      if (nextFails >= 2) {
        setLocked(true);
        advancing.current = true;
        setFeedback('hint');
        if (q?.kind === 'article') setPickedArticle(q.target.article);
        setCardStates((prev) => {
          const next = { ...prev };
          for (const k of optionKeys) {
            if (k === correctKey) next[k] = 'correct';
            else if (k !== wrongKey) next[k] = 'dim';
          }
          return next;
        });
        window.setTimeout(() => goNext(correctCount, sessionXp), 1400);
      } else {
        setFeedback('retry');
        window.setTimeout(() => {
          setCardStates((prev) => {
            const next = { ...prev };
            if (next[wrongKey] === 'wrong') delete next[wrongKey];
            return next;
          });
        }, 500);
      }
    },
    [fails, q, correctCount, sessionXp, goNext],
  );

  const onPickLo = (opt: LearningObject) => {
    if (locked || advancing.current || !q || q.kind === 'article') return;
    const isCorrect = opt.id === q.target.id;
    recordResult(selectedTopic, q.target.id, isCorrect);
    const keys = q.options.map((o) => o.id);
    if (isCorrect) {
      markCorrect(opt.id, keys);
    } else {
      markSoftMiss(opt.id, q.target.id, keys);
    }
  };

  const onPickArticle = (opt: Article) => {
    if (locked || advancing.current || !q || q.kind !== 'article') return;
    const isCorrect = opt === q.target.article;
    recordResult(selectedTopic, q.target.id, isCorrect);
    const keys = q.options as string[];
    if (isCorrect) {
      setPickedArticle(opt);
      markCorrect(opt, keys);
    } else {
      markSoftMiss(opt, q.target.article, keys);
    }
  };

  if (!q) return null;

  const pct = (index / total) * 100;
  const hintWord =
    q.kind === 'article'
      ? `${q.target.article} ${q.target.lemma}`
      : q.target.lemma;

  const kindLabel =
    q.kind === 'picture'
      ? t('mc.kind.picture')
      : q.kind === 'quick'
        ? t('mc.kind.quick')
        : t('mc.kind.article');

  const kindIcon = q.kind === 'picture' ? '🖼️' : q.kind === 'quick' ? '⚡' : '🔤';

  return (
    <div
      className={`screen fade-in ${styles.wrap}`}
      data-master-challenge
      data-kind={q.kind}
    >
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
          ← {t('mc.back')}
        </button>
        <div className={styles.metaChips}>
          <span className={styles.timerChip} dir="ltr" data-timer>
            ⏱ {formatElapsed(elapsedMs)}
          </span>
          <span className={styles.xpChip} dir="ltr">
            ⭐ +{sessionXp}
          </span>
        </div>
      </div>

      <div className={styles.progress}>
        <span className={styles.progressLabel}>
          {t('mc.progress', { current: index + 1, total })}
        </span>
        <div className={styles.track} aria-hidden>
          <div className={styles.fill} style={{ width: `${pct}%` }} />
        </div>
      </div>

      <span className={styles.kindChip} data-kind-chip>
        <span aria-hidden>{kindIcon}</span> {kindLabel}
      </span>

      {q.kind === 'picture' && (
        <>
          <div className={styles.promptCard}>
            <p className={styles.promptLabel}>{t('mc.listen')}</p>
            <div className={styles.audioRow}>
              <button
                type="button"
                className={`${styles.speaker} ${styles.speakerLg} ${speaking ? styles.pulse : ''}`}
                onClick={() => speakTarget('normal')}
                aria-label={t('mc.speak')}
                data-speak
              >
                🔊
              </button>
              <button
                type="button"
                className={styles.slowBtn}
                onClick={() => speakTarget('slow')}
                aria-label={t('mc.slow')}
                data-slow
              >
                🐢
              </button>
            </div>
            {feedback === 'hint' && (
              <p className={styles.lemmaHint}>{t('mc.hint', { word: hintWord })}</p>
            )}
          </div>
          <div className={styles.grid} role="listbox" aria-label={t('mc.pickPicture')}>
            {q.options.map((opt) => {
              const st = cardStates[opt.id] ?? 'idle';
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="option"
                  disabled={locked && st !== 'correct'}
                  className={`${styles.card} ${st !== 'idle' ? styles[st] : ''}`}
                  onClick={() => onPickLo(opt)}
                  data-option={opt.id}
                  data-correct={opt.id === q.target.id ? '1' : '0'}
                  aria-label={opt.lemma}
                >
                  {opt.imageKind === 'url' && !imageErrors[opt.id] ? (
                    <span className={`${styles.imageFrame} ${styles.imageFrameSm}`}>
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
                        : FALLBACK_EMOJI[opt.id] ?? '🏆'}
                    </span>
                  )}
                  {st === 'correct' && (
                    <span className={styles.checkMark} aria-hidden>✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

      {q.kind === 'quick' && (
        <>
          <div className={styles.promptCard}>
            <p className={styles.promptLabel}>{t('mc.promptQuick')}</p>
            <div className={styles.imageFrame}>
              {q.target.imageKind === 'url' && !imageError ? (
                <img
                  className={styles.image}
                  src={q.target.image}
                  alt=""
                  onError={() => setImageError(true)}
                  data-target-image
                />
              ) : (
                <span className={styles.imageFallback} aria-hidden>
                  {FALLBACK_EMOJI[q.target.id] ?? '🏆'}
                </span>
              )}
            </div>
            <div className={styles.audioRow}>
              <button
                type="button"
                className={`${styles.speaker} ${speaking ? styles.pulse : ''}`}
                onClick={() => speakTarget('normal')}
                aria-label={t('mc.speak')}
                data-speak
              >
                🔊
              </button>
              <button
                type="button"
                className={styles.slowBtn}
                onClick={() => speakTarget('slow')}
                aria-label={t('mc.slow')}
                data-slow
              >
                🐢
              </button>
            </div>
            {feedback === 'hint' && (
              <p className={styles.lemmaHint}>{t('mc.hint', { word: hintWord })}</p>
            )}
          </div>
          <div className={styles.options} role="listbox" aria-label={t('mc.pickWord')}>
            {q.options.map((opt) => {
              const st = cardStates[opt.id] ?? 'idle';
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="option"
                  disabled={locked && st !== 'correct'}
                  className={`${styles.option} ${st !== 'idle' ? styles[st] : ''}`}
                  onClick={() => onPickLo(opt)}
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
        </>
      )}

      {q.kind === 'article' && (
        <>
          <div className={styles.promptCard}>
            <p className={styles.promptLabel}>{t('mc.promptArticle')}</p>
            <div className={styles.imageFrame}>
              {q.target.imageKind === 'url' && !imageError ? (
                <img
                  className={styles.image}
                  src={q.target.image}
                  alt=""
                  onError={() => setImageError(true)}
                  data-target-image
                />
              ) : (
                <span className={styles.imageFallback} aria-hidden>
                  {FALLBACK_EMOJI[q.target.id] ?? '🏆'}
                </span>
              )}
            </div>
            <div className={styles.blankRow} dir="ltr" lang="de">
              <span
                className={`${styles.blank} ${
                  pickedArticle || feedback === 'hint' ? styles.blankFilled : ''
                }`}
                data-blank
              >
                {pickedArticle ?? (feedback === 'hint' ? q.target.article : '___')}
              </span>
              <span className={styles.lemmaBig}>{q.target.lemma}</span>
            </div>
            <div className={styles.audioRow}>
              <button
                type="button"
                className={`${styles.speaker} ${speaking ? styles.pulse : ''}`}
                onClick={() => speakTarget('normal')}
                aria-label={t('mc.speak')}
                data-speak
              >
                🔊
              </button>
              <button
                type="button"
                className={styles.slowBtn}
                onClick={() => speakTarget('slow')}
                aria-label={t('mc.slow')}
                data-slow
              >
                🐢
              </button>
            </div>
          </div>
          <div
            className={`${styles.options} ${styles.options3}`}
            role="listbox"
            aria-label={t('mc.pickArticle')}
          >
            {q.options.map((opt) => {
              const st = cardStates[opt] ?? 'idle';
              return (
                <button
                  key={opt}
                  type="button"
                  role="option"
                  disabled={locked && st !== 'correct'}
                  className={`${styles.option} ${styles.optionArt} ${
                    st !== 'idle' ? styles[st] : ''
                  }`}
                  onClick={() => onPickArticle(opt)}
                  data-option={opt}
                  data-correct={opt === q.target.article ? '1' : '0'}
                  aria-label={opt}
                >
                  <span className={styles.article} dir="ltr" lang="de">
                    {opt}
                  </span>
                  {st === 'correct' && (
                    <span className={styles.checkMark} aria-hidden>✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

      <div className={styles.feedback} role="status" aria-live="polite">
        {feedback === 'ok' && (
          <span className={styles.feedbackOk}>{t('mc.correct')}</span>
        )}
        {feedback === 'retry' && (
          <span className={styles.feedbackRetry}>{t('mc.tryAgain')}</span>
        )}
        {feedback === 'hint' && (
          <span className={styles.feedbackHint}>
            {t('mc.hint', { word: hintWord })}
          </span>
        )}
      </div>

      <div className={styles.spacer} />
    </div>
  );
}
