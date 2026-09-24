import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../modules/Auth/AppContext';
import {
  BUILD_ROUND_SIZE,
  buildSession,
  checkBuild,
  formatBuiltSentence,
  type BuildChip,
  type BuildRound,
} from '../modules/FlashArena/buildIt';
import { speakGerman, stopSpeech, warmSpeechVoices } from '../modules/Audio/speech';
import { SpeechSpeedChip } from '../components/SpeechSpeedChip';
import { recordResult } from '../modules/Mastery';
import styles from './BuildItScreen.module.css';

const FALLBACK_EMOJI: Record<string, string> = {
  katze: '🐱', hund: '🐶', fisch: '🐟', vogel: '🐦', pferd: '🐴',
  kuh: '🐮', schaf: '🐑', schwein: '🐷', hase: '🐰', maus: '🐭',
  elefant: '🐘', loewe: '🦁', baer: '🐻', affe: '🐵', ente: '🦆',
  huhn: '🐔', frosch: '🐸', schlange: '🐍', schildkroete: '🐢', biene: '🐝',
  apfel: '🍎', banane: '🍌', brot: '🍞', milch: '🥛', kaese: '🧀',
  ei: '🥚', wasser: '💧', saft: '🧃', reis: '🍚', nudeln: '🍝',
  suppe: '🍲', salat: '🥗', tomate: '🍅', karotte: '🥕', kartoffel: '🥔',
  eis: '🍦', kuchen: '🍰', schokolade: '🍫', pizza: '🍕', orange: '🍊',
  rot: '🔴', blau: '🔵', gelb: '🟡', gruen: '🟢', rosa: '💗',
  lila: '💜', braun: '🟤', grau: '⬜', schwarz: '⚫', weiss: '⚪',
  mutter: '👩', vater: '👨', kind: '🧒', bruder: '👦', schwester: '👧',
  oma: '👵', opa: '👴', baby: '👶', familie: '👨‍👩‍👧', freund: '🤝',
};

export interface BuildItStats {
  correct: number;
  total: number;
  sessionXp: number;
}

interface Props {
  onFinish: (stats: BuildItStats) => void;
}

type Feedback = 'ok' | 'retry' | null;

export function BuildItScreen({ onFinish }: Props) {
  const { t, setScreen, selectedTopic, dir } = useApp();
  const rounds = useMemo(
    () => buildSession(BUILD_ROUND_SIZE, selectedTopic),
    [selectedTopic],
  );
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [bank, setBank] = useState<BuildChip[]>([]);
  const [slots, setSlots] = useState<(BuildChip | null)[]>([]);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [shake, setShake] = useState(false);
  const [locked, setLocked] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const advancing = useRef(false);
  const autoChecked = useRef(false);

  const round: BuildRound | undefined = rounds[index];
  const total = rounds.length || BUILD_ROUND_SIZE;

  const resetRound = useCallback((r: BuildRound) => {
    setBank(r.bank);
    setSlots(Array.from({ length: r.answer.length }, () => null));
    setFeedback(null);
    setShake(false);
    setLocked(false);
    setImageError(false);
    advancing.current = false;
    autoChecked.current = false;
  }, []);

  useEffect(() => {
    warmSpeechVoices();
    return () => stopSpeech();
  }, []);

  useEffect(() => {
    if (!round) return;
    resetRound(round);
  }, [index, round, resetRound]);

  const playSentence = useCallback(
    (rate: 'normal' | 'slow' = 'normal') => {
      if (!round) return;
      const text = formatBuiltSentence(round.answer);
      setSpeaking(true);
      speakGerman(text, rate);
      window.setTimeout(() => setSpeaking(false), rate === 'slow' ? 2200 : 1400);
    },
    [round],
  );

  const goNext = useCallback(
    (nextCorrect: number, nextXp: number) => {
      if (index + 1 >= total) {
        onFinish({ correct: nextCorrect, total, sessionXp: nextXp });
      } else {
        setIndex((i) => i + 1);
      }
    },
    [index, total, onFinish],
  );

  const onCorrect = useCallback(() => {
    if (!round || advancing.current) return;
    advancing.current = true;
    setLocked(true);
    setFeedback('ok');
    recordResult(selectedTopic, round.lo.id, true);
    const nextCorrect = correctCount + 1;
    const gained = 8;
    const nextXp = sessionXp + gained;
    setCorrectCount(nextCorrect);
    setSessionXp(nextXp);
    playSentence('normal');
    window.setTimeout(() => goNext(nextCorrect, nextXp), 1100);
  }, [round, correctCount, sessionXp, playSentence, goNext, selectedTopic]);

  const onMiss = useCallback(() => {
    if (round) recordResult(selectedTopic, round.lo.id, false);
    setFeedback('retry');
    setShake(true);
    window.setTimeout(() => setShake(false), 480);
    // Soft miss — clear slots back to bank after a beat so they can retry
    window.setTimeout(() => {
      if (!round || advancing.current) return;
      setBank((prev) => {
        const returned = slots.filter((s): s is BuildChip => Boolean(s));
        return [...prev, ...returned];
      });
      setSlots(Array.from({ length: round.answer.length }, () => null));
      setFeedback(null);
      autoChecked.current = false;
    }, 650);
  }, [round, slots, selectedTopic]);

  const runCheck = useCallback(() => {
    if (!round || locked || advancing.current) return;
    const placed = slots.map((s) => s?.text ?? '');
    if (placed.some((t) => !t)) return;
    if (checkBuild(placed, round.answer)) {
      onCorrect();
    } else {
      onMiss();
    }
  }, [round, locked, slots, onCorrect, onMiss]);

  // Auto-check when every slot is filled
  useEffect(() => {
    if (!round || locked || advancing.current) return;
    const filled = slots.length > 0 && slots.every(Boolean);
    if (filled && !autoChecked.current) {
      autoChecked.current = true;
      const timer = window.setTimeout(() => runCheck(), 180);
      return () => window.clearTimeout(timer);
    }
    if (!filled) autoChecked.current = false;
  }, [slots, round, locked, runCheck]);

  const pickChip = (chip: BuildChip) => {
    if (locked || advancing.current) return;
    setFeedback(null);
    setSlots((prev) => {
      if (prev.some((s) => s?.id === chip.id)) return prev;
      const emptyIdx = prev.findIndex((s) => s === null);
      if (emptyIdx < 0) return prev;
      const next = [...prev];
      next[emptyIdx] = chip;
      return next;
    });
    setBank((prev) => prev.filter((c) => c.id !== chip.id));
  };

  const returnChip = (slotIdx: number) => {
    if (locked || advancing.current) return;
    const chip = slots[slotIdx];
    if (!chip) return;
    setFeedback(null);
    autoChecked.current = false;
    setSlots((prev) => {
      const next = [...prev];
      next[slotIdx] = null;
      return next;
    });
    setBank((prev) => [...prev, chip]);
  };

  const clearAll = () => {
    if (locked || advancing.current || !round) return;
    const returned = slots.filter((s): s is BuildChip => Boolean(s));
    if (!returned.length) return;
    setSlots(Array.from({ length: round.answer.length }, () => null));
    setBank((prev) => [...prev, ...returned]);
    setFeedback(null);
    autoChecked.current = false;
  };

  if (!round) {
    return (
      <div className={`screen fade-in ${styles.wrap}`}>
        <p className={styles.empty}>{t('bi.empty')}</p>
        <button type="button" className="btn-ghost" onClick={() => setScreen('gameModes')}>
          {t('bi.back')}
        </button>
      </div>
    );
  }

  const lo = round.lo;
  const pct = (index / total) * 100;
  const allFilled = slots.length > 0 && slots.every(Boolean);
  const imageSrc = lo.imageKind === 'url' ? lo.image : null;
  const emoji =
    lo.imageKind === 'emoji' ? lo.image : FALLBACK_EMOJI[lo.id] ?? '🧩';

  return (
    <div className={`screen fade-in ${styles.wrap}`} data-build-it data-answer={round.answer.join('|')}>
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
          ← {t('bi.back')}
        </button>
        <span className={styles.xpChip} dir="ltr">
          ⭐ +{sessionXp}
        </span>
      </div>

      <div className={styles.progress}>
        <span className={styles.progressLabel}>
          {t('bi.progress', { current: index + 1, total })}
        </span>
        <div className={styles.track} aria-hidden>
          <div className={styles.fill} style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className={styles.promptCard}>
        <p className={styles.promptLabel}>{t('bi.prompt')}</p>
        <div className={styles.imageWrap}>
          {imageSrc && !imageError ? (
            <span className={styles.imageFrame}>
              <img
                className={styles.image}
                src={imageSrc}
                alt=""
                onError={() => setImageError(true)}
              />
            </span>
          ) : (
            <span className={styles.emoji} aria-hidden>
              {emoji}
            </span>
          )}
        </div>
        <p className={styles.lemma} dir="ltr">
          {lo.article} {lo.lemma}
        </p>
        <div className={styles.audioRow}>
          <button
            type="button"
            className={`${styles.speaker} ${speaking ? styles.pulse : ''}`}
            onClick={() => playSentence('normal')}
            aria-label={t('bi.listen')}
            data-speak
            disabled={!feedback || feedback !== 'ok'}
            title={t('bi.listen')}
          >
            🔊
          </button>
        </div>
      </div>

      {/* Answer slots — LTR for German sentence order */}
      <div
        className={`${styles.slots} ${shake ? styles.shake : ''} ${
          feedback === 'ok' ? styles.slotsOk : ''
        }`}
        dir="ltr"
        role="list"
        aria-label={t('bi.slots')}
        data-slots
      >
        {slots.map((chip, i) => (
          <button
            key={`slot-${i}`}
            type="button"
            role="listitem"
            className={`${styles.slot} ${chip ? styles.slotFilled : styles.slotEmpty}`}
            onClick={() => returnChip(i)}
            disabled={!chip || locked}
            data-slot={i}
            data-filled={chip ? '1' : '0'}
            aria-label={chip ? chip.text : t('bi.emptySlot')}
          >
            {chip ? <span dir="ltr">{chip.text}</span> : <span className={styles.slotGhost}>{i + 1}</span>}
          </button>
        ))}
      </div>

      {/* Word bank — RTL-aware flex wrap for chip flow */}
      <div
        className={styles.bank}
        dir={dir}
        role="list"
        aria-label={t('bi.bank')}
        data-bank
      >
        {bank.map((chip) => (
          <button
            key={chip.id}
            type="button"
            role="listitem"
            className={styles.chip}
            onClick={() => pickChip(chip)}
            disabled={locked}
            data-chip={chip.id}
            dir="ltr"
          >
            {chip.text}
          </button>
        ))}
        {bank.length === 0 && (
          <span className={styles.bankEmpty}>{t('bi.bankEmpty')}</span>
        )}
      </div>

      <div className={styles.feedback} role="status" aria-live="polite">
        {feedback === 'ok' && (
          <span className={styles.feedbackOk}>{t('bi.correct')}</span>
        )}
        {feedback === 'retry' && (
          <span className={styles.feedbackRetry}>{t('bi.tryAgain')}</span>
        )}
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.clearBtn}
          onClick={clearAll}
          disabled={locked || slots.every((s) => !s)}
          data-clear
        >
          {t('bi.clear')}
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={runCheck}
          disabled={locked || !allFilled}
          data-check
        >
          {t('bi.check')}
        </button>
      </div>
    </div>
  );
}
