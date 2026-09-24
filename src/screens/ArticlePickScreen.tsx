import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../modules/Auth/AppContext';
import {
  buildSession,
  type ArticlePickQuestion,
} from '../modules/FlashArena/articlePick';
import { recordResult } from '../modules/Mastery';
import { speakGerman, stopSpeech, warmSpeechVoices } from '../modules/Audio/speech';
import { SpeechSpeedChip } from '../components/SpeechSpeedChip';
import { getLevelParams } from '../modules/Content/levelDifficulty';
import type { Article } from '../modules/Content/types';
import styles from './ArticlePickScreen.module.css';

type CardState = 'idle' | 'correct' | 'wrong' | 'dim';

interface Props {
  onFinish: (correct: number, sessionXp: number) => void;
}

export function ArticlePickScreen({ onFinish }: Props) {
  const { t, setScreen, selectedTopic, selectedLevel } = useApp();
  const levelParams = useMemo(() => getLevelParams(selectedLevel), [selectedLevel]);
  const questions = useMemo(
    () => buildSession(levelParams.roundSize, selectedTopic, selectedLevel),
    [selectedTopic, selectedLevel, levelParams.roundSize],
  );
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [fails, setFails] = useState(0);
  const [feedback, setFeedback] = useState<'ok' | 'retry' | 'hint' | null>(null);
  const [locked, setLocked] = useState(false);
  const [cardStates, setCardStates] = useState<Record<string, CardState>>({});
  const [pickedArticle, setPickedArticle] = useState<Article | null>(null);
  const [imageError, setImageError] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const advancing = useRef(false);

  const q: ArticlePickQuestion = questions[index];
  const total = questions.length;

  const play = useCallback(
    (rate: 'normal' | 'slow' = 'normal') => {
      if (!q) return;
      setSpeaking(true);
      speakGerman(`${q.target.article} ${q.target.lemma}`, rate);
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
    setPickedArticle(null);
    setImageError(false);
    advancing.current = false;
  }, [index, q]);

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

  const onPick = (opt: Article) => {
    if (locked || advancing.current || !q) return;
    const isCorrect = opt === q.target.article;
    recordResult(selectedTopic, q.target.id, isCorrect);

    if (isCorrect) {
      setLocked(true);
      advancing.current = true;
      setPickedArticle(opt);
      const nextCorrect = correctCount + 1;
      const gained = 5;
      const nextXp = sessionXp + gained;
      setCorrectCount(nextCorrect);
      setSessionXp(nextXp);
      setFeedback('ok');
      const nextStates: Record<string, CardState> = {};
      for (const o of q.options) {
        nextStates[o] = o === opt ? 'correct' : 'dim';
      }
      setCardStates(nextStates);
      window.setTimeout(() => goNext(nextCorrect, nextXp), 750);
      return;
    }

    const nextFails = fails + 1;
    setFails(nextFails);
    setCardStates((prev) => ({ ...prev, [opt]: 'wrong' }));

    if (nextFails >= 2) {
      setLocked(true);
      advancing.current = true;
      setPickedArticle(q.target.article);
      setFeedback('hint');
      setCardStates((prev) => {
        const next = { ...prev };
        for (const o of q.options) {
          if (o === q.target.article) next[o] = 'correct';
          else if (o !== opt) next[o] = 'dim';
        }
        return next;
      });
      window.setTimeout(() => goNext(correctCount, sessionXp), 1400);
    } else {
      setFeedback('retry');
      window.setTimeout(() => {
        setCardStates((prev) => {
          const next = { ...prev };
          if (next[opt] === 'wrong') delete next[opt];
          return next;
        });
      }, 500);
    }
  };

  if (!q) return null;

  const pct = (index / total) * 100;
  const showUrl = q.target.imageKind === 'url' && !imageError;
  const blankText =
    pickedArticle ?? (feedback === 'hint' ? q.target.article : '___');

  return (
    <div className={`screen fade-in ${styles.wrap}`} data-article-pick>
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
          ← {t('ap.back')}
        </button>
        <span className={styles.xpChip} dir="ltr">⭐ +{sessionXp}</span>
      </div>

      <div className={styles.progress}>
        <span className={styles.progressLabel}>
          {t('ap.progress', { current: index + 1, total })}
        </span>
        <div className={styles.track} aria-hidden>
          <div className={styles.fill} style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className={styles.promptCard}>
        <p className={styles.promptLabel}>{t('ap.prompt')}</p>
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
        <div className={styles.blankRow} dir="ltr" lang="de">
          <span
            className={`${styles.blank} ${
              pickedArticle || feedback === 'hint' ? styles.blankFilled : ''
            }`}
            data-blank
          >
            {blankText}
          </span>
          <span className={styles.lemma}>{q.target.lemma}</span>
        </div>
        <div className={styles.audioRow}>
          <button
            type="button"
            className={`${styles.speaker} ${speaking ? styles.pulse : ''}`}
            onClick={() => play('normal')}
            aria-label={t('ap.speak')}
            data-speak
          >
            🔊
          </button>
          <button
            type="button"
            className={styles.slowBtn}
            onClick={() => play('slow')}
            aria-label={t('ap.slow')}
            title={t('ap.slow')}
            data-slow
          >
            🐢
          </button>
        </div>
        {feedback === 'hint' && (
          <p className={styles.hint}>
            {t('ap.hint', {
              word: `${q.target.article} ${q.target.lemma}`,
            })}
          </p>
        )}
      </div>

      <div className={styles.options} role="listbox" aria-label={t('ap.pick')}>
        {q.options.map((opt) => {
          const st = cardStates[opt] ?? 'idle';
          return (
            <button
              key={opt}
              type="button"
              role="option"
              disabled={locked && st !== 'correct'}
              className={`${styles.option} ${st !== 'idle' ? styles[st] : ''}`}
              onClick={() => onPick(opt)}
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

      <div className={styles.feedback} role="status" aria-live="polite">
        {feedback === 'ok' && (
          <span className={styles.feedbackOk}>{t('ap.correct')}</span>
        )}
        {feedback === 'retry' && (
          <span className={styles.feedbackRetry}>{t('ap.tryAgain')}</span>
        )}
        {feedback === 'hint' && (
          <span className={styles.feedbackHint}>
            {t('ap.hint', {
              word: `${q.target.article} ${q.target.lemma}`,
            })}
          </span>
        )}
      </div>

      <div className={styles.spacer} />
    </div>
  );
}
