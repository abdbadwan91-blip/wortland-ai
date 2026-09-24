import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../modules/Auth/AppContext';
import {
  buildSession,
  getDefaultMission,
  type ConversationBeat,
  type ConversationChoice,
} from '../modules/FlashArena/conversationMission';
import { recordResult } from '../modules/Mastery';
import styles from './ConversationMissionScreen.module.css';
import { SpeechSpeedChip } from '../components/SpeechSpeedChip';
import { speakGerman } from '../modules/Audio/speech';

type ChoiceState = 'idle' | 'correct' | 'wrong' | 'dim';

interface Props {
  onFinish: (correct: number, sessionXp: number, total: number) => void;
}

export function ConversationMissionScreen({ onFinish }: Props) {
  const { t, setScreen } = useApp();
  const mission = useMemo(() => getDefaultMission(), []);
  const beats = useMemo(() => buildSession(mission), [mission]);
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [feedback, setFeedback] = useState<'ok' | 'retry' | 'hint' | null>(null);
  const [locked, setLocked] = useState(false);
  const [choiceStates, setChoiceStates] = useState<Record<string, ChoiceState>>({});
  const [imageError, setImageError] = useState(false);
  const [showTranslation, setShowTranslation] = useState<string | null>(null);
  const advancing = useRef(false);
  const failsRef = useRef(0);

  const beat: ConversationBeat | undefined = beats[index];
  const total = beats.length;

  useEffect(() => {
    failsRef.current = 0;
    setFeedback(null);
    setLocked(false);
    setChoiceStates({});
    setImageError(false);
    setShowTranslation(null);
    advancing.current = false;
  }, [index]);

  const goNext = useCallback(
    (nextCorrect: number, nextXp: number) => {
      if (index + 1 >= total) {
        onFinish(nextCorrect, nextXp, total);
      } else {
        setIndex((i) => i + 1);
      }
    },
    [index, total, onFinish],
  );

  const recordLight = (b: ConversationBeat, isCorrect: boolean) => {
    if (b.loId && b.topicId) {
      recordResult(b.topicId, b.loId, isCorrect);
    }
  };

  const onPick = (choice: ConversationChoice) => {
    if (locked || advancing.current || !beat) return;
    const isCorrect = choice.id === beat.correctId;
    recordLight(beat, isCorrect);

    if (isCorrect) {
      setLocked(true);
      advancing.current = true;
      const nextCorrect = correctCount + 1;
      const gained = 5;
      const nextXp = sessionXp + gained;
      setCorrectCount(nextCorrect);
      setSessionXp(nextXp);
      setFeedback('ok');
      const nextStates: Record<string, ChoiceState> = {};
      for (const c of beat.choices) {
        nextStates[c.id] = c.id === choice.id ? 'correct' : 'dim';
      }
      setChoiceStates(nextStates);
      window.setTimeout(() => goNext(nextCorrect, nextXp), 750);
      return;
    }

    const nextFails = failsRef.current + 1;
    failsRef.current = nextFails;
    setChoiceStates((prev) => ({ ...prev, [choice.id]: 'wrong' }));

    if (nextFails >= 2) {
      setLocked(true);
      advancing.current = true;
      setFeedback('hint');
      setChoiceStates((prev) => {
        const next = { ...prev };
        for (const c of beat.choices) {
          if (c.id === beat.correctId) next[c.id] = 'correct';
          else if (c.id !== choice.id) next[c.id] = 'dim';
        }
        return next;
      });
      window.setTimeout(() => goNext(correctCount, sessionXp), 1400);
    } else {
      setFeedback('retry');
      window.setTimeout(() => {
        setChoiceStates((prev) => {
          const next = { ...prev };
          if (next[choice.id] === 'wrong') delete next[choice.id];
          return next;
        });
      }, 500);
    }
  };

  if (!beat) return null;

  const pct = (index / total) * 100;
  const correctGerman =
    beat.choices.find((c) => c.id === beat.correctId)?.german ?? '';

  return (
    <div className={`screen fade-in ${styles.wrap}`} data-conversation-mission>
      <div className={styles.topBar}>
        
        <SpeechSpeedChip />
<button
          type="button"
          className="back-chip"
          onClick={() => setScreen('gameModes')}
        >
          ← {t('cm.back')}
        </button>
        <span className={styles.xpChip} dir="ltr">
          ⭐ +{sessionXp}
        </span>
      </div>

      <p className={styles.missionTitle}>{t(mission.titleKey)}</p>
      <div className={styles.cast} aria-label="Anna und Max">
        <span className={styles.avatar}>👩🏻 <b>Anna</b></span>
        <span className={styles.chatPulse}>•••</span>
        <span className={styles.avatar}>👦🏻 <b>Max</b></span>
      </div>

      <div className={styles.progress}>
        <span className={styles.progressLabel}>
          {t('cm.progress', { current: index + 1, total })}
        </span>
        <div className={styles.track} aria-hidden>
          <div className={styles.fill} style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className={styles.sceneCard} data-beat={beat.id}>
        <div className={styles.imageFrame} data-scene-image>
          {beat.imageKind === 'url' && !imageError ? (
            <img
              className={styles.image}
              src={beat.image}
              alt=""
              onError={() => setImageError(true)}
            />
          ) : (
            <span className={styles.emoji} aria-hidden>
              {beat.imageKind === 'emoji' ? beat.image : '☕'}
            </span>
          )}
        </div>
        <p className={styles.context}>{t(beat.contextKey)}</p>
        <p className={styles.prompt}>{t('cm.pick')}</p>
      </div>

      <div
        className={styles.choices}
        role="listbox"
        aria-label={t('cm.pick')}
        data-choices
      >
        {beat.choices.map((choice) => {
          const st = choiceStates[choice.id] ?? 'idle';
          return (
            <button
              key={choice.id}
              type="button"
              role="option"
              disabled={locked && st !== 'correct'}
              className={`${styles.choice} ${st !== 'idle' ? styles[st] : ''}`}
              onClick={() => onPick(choice)}
              data-choice={choice.id}
              data-correct={choice.id === beat.correctId ? '1' : '0'}
            >
              <span className={styles.choiceCopy}>
                <span dir="ltr">{choice.german}</span>
                {showTranslation === choice.id && choice.translation ? (
                  <small className={styles.translation}>{choice.translation}</small>
                ) : null}
              </span>
              <span className={styles.choiceTools}>
                <button type="button" className={styles.miniTool} aria-label="Deutsch anhören" onClick={(e) => { e.stopPropagation(); speakGerman(choice.german); }}>🔊</button>
                {choice.translation ? <button type="button" className={styles.miniTool} aria-label="Übersetzung" onClick={(e) => { e.stopPropagation(); setShowTranslation((id) => id === choice.id ? null : choice.id); }}>文</button> : null}
              </span>
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
          <span className={styles.feedbackOk}>{t('cm.correct')}</span>
        )}
        {feedback === 'retry' && (
          <span className={styles.feedbackRetry}>{t('cm.tryAgain')}</span>
        )}
        {feedback === 'hint' && (
          <span className={styles.feedbackHint}>
            {t('cm.hint', { reply: correctGerman })}
          </span>
        )}
      </div>

      <div className={styles.spacer} />
    </div>
  );
}
