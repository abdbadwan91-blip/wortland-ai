import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../modules/Auth/AppContext';
import {
  buildSession,
  checkPuzzle,
  nextHintIndex,
  type LetterTile,
  type WordPuzzleRound,
} from '../modules/FlashArena/wordPuzzle';
import { getLevelParams } from '../modules/Content/levelDifficulty';
import { speakGerman, stopSpeech, warmSpeechVoices } from '../modules/Audio/speech';
import { SpeechSpeedChip } from '../components/SpeechSpeedChip';
import { recordResult } from '../modules/Mastery';
import styles from './WordPuzzleScreen.module.css';

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
  mutter: '👩', vater: '👨', kind: '🧒', bruder: '👦', schwester: '👧',
};

interface Props {
  onFinish: (correct: number, sessionXp: number) => void;
}

type Feedback = 'ok' | 'retry' | 'hint' | null;

export function WordPuzzleScreen({ onFinish }: Props) {
  const { t, setScreen, selectedTopic, selectedLevel, profile, updateProfile, dir } =
    useApp();
  const levelParams = useMemo(() => getLevelParams(selectedLevel), [selectedLevel]);
  const rounds = useMemo(
    () => buildSession(levelParams.roundSize, selectedTopic, selectedLevel),
    [selectedTopic, selectedLevel, levelParams.roundSize],
  );
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [bank, setBank] = useState<LetterTile[]>([]);
  const [slots, setSlots] = useState<(LetterTile | null)[]>([]);
  /** Slot indices locked by hint reveal (cannot tap away) */
  const [lockedSlots, setLockedSlots] = useState<Set<number>>(() => new Set());
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [shake, setShake] = useState(false);
  const [locked, setLocked] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [timerLeft, setTimerLeft] = useState<number | null>(null);
  const [freeHintUsed, setFreeHintUsed] = useState(false);
  const advancing = useRef(false);
  const autoChecked = useRef(false);
  const failsRef = useRef(0);
  const softTimedOut = useRef(false);
  const slotsRef = useRef<(LetterTile | null)[]>([]);
  const bankRef = useRef<LetterTile[]>([]);
  const lockedSlotsRef = useRef<Set<number>>(new Set());


  const round: WordPuzzleRound | undefined = rounds[index];
  const total = rounds.length;

  const resetRound = useCallback((r: WordPuzzleRound) => {
    setBank(r.bank);
    setSlots(Array.from({ length: r.answer.length }, () => null));
    setLockedSlots(new Set());
    setFeedback(null);
    setShake(false);
    setLocked(false);
    setImageError(false);
    setFreeHintUsed(false);
    advancing.current = false;
    autoChecked.current = false;
    failsRef.current = 0;
    softTimedOut.current = false;
    setTimerLeft(levelParams.timerSec);
  }, [levelParams.timerSec]);

  useEffect(() => {
    warmSpeechVoices();
    return () => stopSpeech();
  }, []);

  useEffect(() => {
    if (!round) return;
    resetRound(round);
  }, [index, round, resetRound]);

  useEffect(() => {
    slotsRef.current = slots;
  }, [slots]);
  useEffect(() => {
    bankRef.current = bank;
  }, [bank]);
  useEffect(() => {
    lockedSlotsRef.current = lockedSlots;
  }, [lockedSlots]);

  useEffect(() => {
    if (!round || levelParams.timerSec == null || locked || advancing.current) return;
    if (timerLeft == null || timerLeft <= 0) return;
    const id = window.setTimeout(() => {
      setTimerLeft((prev) => (prev == null ? prev : Math.max(0, prev - 1)));
    }, 1000);
    return () => window.clearTimeout(id);
  }, [timerLeft, round, levelParams.timerSec, locked]);

  const play = useCallback(
    (rate: 'normal' | 'slow' = 'normal') => {
      if (!round) return;
      setSpeaking(true);
      speakGerman(round.target.lemma, rate);
      window.setTimeout(() => setSpeaking(false), rate === 'slow' ? 1800 : 1100);
    },
    [round],
  );

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

  /** Soft miss: reveal full lemma and advance (timeout / give-up path). */
  const softMissAndAdvance = useCallback(() => {
    if (!round || advancing.current) return;
    setLocked(true);
    advancing.current = true;
    setFeedback('hint');
    // Fill slots with correct letters for visual reveal
    const revealed: LetterTile[] = round.answer.map((letter, i) => ({
      id: `reveal-${i}`,
      letter,
    }));
    setSlots(revealed);
    setBank([]);
    setLockedSlots(new Set(round.answer.map((_, i) => i)));
    recordResult(selectedTopic, round.target.id, false);
    window.setTimeout(() => goNext(correctCount, sessionXp), 1300);
  }, [round, goNext, correctCount, sessionXp, selectedTopic]);

  useEffect(() => {
    if (timerLeft !== 0 || softTimedOut.current || !round) return;
    if (locked || advancing.current) return;
    if (levelParams.timerSec == null) return;
    softTimedOut.current = true;
    softMissAndAdvance();
  }, [timerLeft, round, locked, levelParams.timerSec, softMissAndAdvance]);

  const onCorrect = useCallback(() => {
    if (!round || advancing.current) return;
    advancing.current = true;
    setLocked(true);
    setFeedback('ok');
    recordResult(selectedTopic, round.target.id, true);
    const nextCorrect = correctCount + 1;
    const gained = 6;
    const nextXp = sessionXp + gained;
    setCorrectCount(nextCorrect);
    setSessionXp(nextXp);
    play('normal');
    window.setTimeout(() => goNext(nextCorrect, nextXp), 900);
  }, [round, correctCount, sessionXp, play, goNext, selectedTopic]);

  /** Apply a one-letter soft hint against current bank/slots. */
  const applyLetterHint = useCallback(
    (
      curSlots: (LetterTile | null)[],
      curBank: LetterTile[],
      curLocked: Set<number>,
    ): {
      slots: (LetterTile | null)[];
      bank: LetterTile[];
      locked: Set<number>;
      ok: boolean;
    } => {
      if (!round) {
        return { slots: curSlots, bank: curBank, locked: curLocked, ok: false };
      }
      const placed = curSlots.map((s) => s?.letter ?? null);
      const hintIdx = nextHintIndex(placed, round.answer);
      if (hintIdx < 0) {
        return { slots: curSlots, bank: curBank, locked: curLocked, ok: false };
      }
      const needed = round.answer[hintIdx];
      let nextSlots = [...curSlots];
      let nextBank = [...curBank];
      let tile: LetterTile | null = null;

      const bankHit = nextBank.find((t) => t.letter === needed);
      if (bankHit) {
        tile = bankHit;
        nextBank = nextBank.filter((t) => t.id !== bankHit.id);
      } else {
        const fromSlot = nextSlots.findIndex(
          (s, i) =>
            s && s.letter === needed && i !== hintIdx && !curLocked.has(i),
        );
        if (fromSlot >= 0) {
          tile = nextSlots[fromSlot]!;
          nextSlots[fromSlot] = null;
        }
      }

      const occupant = nextSlots[hintIdx];
      if (occupant && !curLocked.has(hintIdx)) {
        if (!(tile && occupant.id === tile.id)) {
          nextBank = [...nextBank, occupant];
        }
        nextSlots[hintIdx] = null;
      }

      if (!tile) {
        tile = { id: `hint-${hintIdx}-${needed}`, letter: needed };
      }
      nextSlots[hintIdx] = tile;
      const nextLocked = new Set(curLocked);
      nextLocked.add(hintIdx);
      return { slots: nextSlots, bank: nextBank, locked: nextLocked, ok: true };
    },
    [round],
  );

  const clearUnlockedToBank = useCallback(
    (
      curSlots: (LetterTile | null)[],
      curBank: LetterTile[],
      curLocked: Set<number>,
    ) => {
      const returned: LetterTile[] = [];
      const nextSlots = curSlots.map((s, i) => {
        if (!s) return null;
        if (curLocked.has(i)) return s;
        returned.push(s);
        return null;
      });
      return { slots: nextSlots, bank: [...curBank, ...returned] };
    },
    [],
  );

  const revealOneLetter = useCallback(() => {
    if (!round || locked || advancing.current) return false;
    const result = applyLetterHint(
      slotsRef.current,
      bankRef.current,
      lockedSlotsRef.current,
    );
    if (!result.ok) return false;
    setSlots(result.slots);
    setBank(result.bank);
    setLockedSlots(result.locked);
    autoChecked.current = false;
    setFeedback('hint');
    return true;
  }, [round, locked, applyLetterHint]);

  const onMiss = useCallback(() => {
    if (!round) return;
    recordResult(selectedTopic, round.target.id, false);
    const nextFails = failsRef.current + 1;
    failsRef.current = nextFails;
    setFeedback('retry');
    setShake(true);
    window.setTimeout(() => setShake(false), 480);

    const delay = nextFails >= 2 ? 550 : 650;
    window.setTimeout(() => {
      if (advancing.current) return;
      const cleared = clearUnlockedToBank(
        slotsRef.current,
        bankRef.current,
        lockedSlotsRef.current,
      );
      if (nextFails >= 2) {
        const hinted = applyLetterHint(
          cleared.slots,
          cleared.bank,
          lockedSlotsRef.current,
        );
        setSlots(hinted.slots);
        setBank(hinted.bank);
        setLockedSlots(hinted.locked);
        setFeedback('hint');
      } else {
        setSlots(cleared.slots);
        setBank(cleared.bank);
        setFeedback(null);
      }
      autoChecked.current = false;
    }, delay);
  }, [round, selectedTopic, clearUnlockedToBank, applyLetterHint]);

  const runCheck = useCallback(() => {
    if (!round || locked || advancing.current) return;
    const placed = slots.map((s) => s?.letter ?? '');
    if (placed.some((ch) => !ch)) return;
    if (checkPuzzle(placed, round.answer)) {
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

  const pickTile = (tile: LetterTile) => {
    if (locked || advancing.current) return;
    setFeedback(null);
    setSlots((prev) => {
      if (prev.some((s) => s?.id === tile.id)) return prev;
      const emptyIdx = prev.findIndex((s, i) => s === null && !lockedSlots.has(i));
      if (emptyIdx < 0) return prev;
      const next = [...prev];
      next[emptyIdx] = tile;
      return next;
    });
    setBank((prev) => prev.filter((t) => t.id !== tile.id));
  };

  const returnTile = (slotIdx: number) => {
    if (locked || advancing.current) return;
    if (lockedSlots.has(slotIdx)) return;
    const tile = slots[slotIdx];
    if (!tile) return;
    setFeedback(null);
    autoChecked.current = false;
    setSlots((prev) => {
      const next = [...prev];
      next[slotIdx] = null;
      return next;
    });
    setBank((prev) => [...prev, tile]);
  };

  const clearAll = () => {
    if (locked || advancing.current || !round) return;
    const returned: LetterTile[] = [];
    setSlots((prev) =>
      prev.map((s, i) => {
        if (!s || lockedSlots.has(i)) return s;
        returned.push(s);
        return null;
      }),
    );
    if (!returned.length) return;
    setBank((prev) => [...prev, ...returned]);
    setFeedback(null);
    autoChecked.current = false;
  };

  const onHint = () => {
    if (locked || advancing.current || !round) return;
    if (freeHintUsed) {
      // 1-coin stub: deduct if possible, still allow hint
      if (profile.coins >= 1) {
        updateProfile({ coins: profile.coins - 1 });
      }
    } else {
      setFreeHintUsed(true);
    }
    const ok = revealOneLetter();
    if (!ok) return;
  };

  if (!round) {
    return (
      <div className={`screen fade-in ${styles.wrap}`}>
        <p className={styles.empty}>{t('wp.empty')}</p>
        <button type="button" className="btn-ghost" onClick={() => setScreen('gameModes')}>
          {t('wp.back')}
        </button>
      </div>
    );
  }

  const lo = round.target;
  const pct = (index / total) * 100;
  const allFilled = slots.length > 0 && slots.every(Boolean);
  const imageSrc = lo.imageKind === 'url' ? lo.image : null;
  const emoji =
    lo.imageKind === 'emoji' ? lo.image : FALLBACK_EMOJI[lo.id] ?? '🔠';
  const hintCostLabel = freeHintUsed ? t('wp.hintPaid') : t('wp.hintFree');

  return (
    <div
      className={`screen fade-in ${styles.wrap}`}
      data-word-puzzle
      data-answer={round.answer.join('')}
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
          ← {t('wp.back')}
        </button>
        <span className={styles.xpChip} dir="ltr">
          ⭐ +{sessionXp}
        </span>
      </div>

      <div className={styles.progress}>
        <span className={styles.progressLabel}>
          {t('wp.progress', { current: index + 1, total })}
        </span>
        <div className={styles.track} aria-hidden>
          <div className={styles.fill} style={{ width: `${pct}%` }} />
        </div>
      </div>

      {timerLeft != null && (
        <div
          className={`${styles.softTimer} ${timerLeft <= 3 ? styles.softTimerLow : ''}`}
          data-soft-timer
          aria-live="polite"
        >
          ⏱️ {timerLeft}s
        </div>
      )}

      <div className={styles.promptCard}>
        <p className={styles.promptLabel}>{t('wp.prompt')}</p>
        <div className={styles.imageWrap}>
          {imageSrc && !imageError ? (
            <span className={styles.imageFrame}>
              <img
                className={styles.image}
                src={imageSrc}
                alt=""
                onError={() => setImageError(true)}
                data-target-image
              />
            </span>
          ) : (
            <span className={styles.emoji} aria-hidden>
              {emoji}
            </span>
          )}
        </div>
        <div className={styles.audioRow}>
          <button
            type="button"
            className={`${styles.speaker} ${speaking ? styles.pulse : ''}`}
            onClick={() => play('normal')}
            aria-label={t('wp.speak')}
            data-speak
            title={t('wp.speak')}
          >
            🔊
          </button>
        </div>
        {feedback === 'hint' && advancing.current && (
          <p className={styles.lemmaReveal} dir="ltr" lang="de">
            {lo.lemma}
          </p>
        )}
      </div>

      <div
        className={`${styles.slots} ${shake ? styles.shake : ''} ${
          feedback === 'ok' ? styles.slotsOk : ''
        }`}
        dir="ltr"
        role="list"
        aria-label={t('wp.slots')}
        data-slots
      >
        {slots.map((tile, i) => (
          <button
            key={`slot-${i}`}
            type="button"
            role="listitem"
            className={`${styles.slot} ${
              tile
                ? lockedSlots.has(i)
                  ? `${styles.slotFilled} ${styles.slotHint}`
                  : styles.slotFilled
                : styles.slotEmpty
            }`}
            onClick={() => returnTile(i)}
            disabled={!tile || locked || lockedSlots.has(i)}
            data-slot={i}
            data-filled={tile ? '1' : '0'}
            data-hint-locked={lockedSlots.has(i) ? '1' : '0'}
            aria-label={tile ? tile.letter : t('wp.emptySlot')}
          >
            {tile ? (
              <span dir="ltr">{tile.letter}</span>
            ) : (
              <span className={styles.slotGhost}>{i + 1}</span>
            )}
          </button>
        ))}
      </div>

      <div
        className={styles.bank}
        dir={dir}
        role="list"
        aria-label={t('wp.bank')}
        data-bank
      >
        {bank.map((tile) => (
          <button
            key={tile.id}
            type="button"
            role="listitem"
            className={styles.tile}
            onClick={() => pickTile(tile)}
            disabled={locked}
            data-tile={tile.id}
            data-letter={tile.letter}
            dir="ltr"
          >
            {tile.letter}
          </button>
        ))}
        {bank.length === 0 && (
          <span className={styles.bankEmpty}>{t('wp.bankEmpty')}</span>
        )}
      </div>

      <div className={styles.feedback} role="status" aria-live="polite">
        {feedback === 'ok' && (
          <span className={styles.feedbackOk}>{t('wp.correct')}</span>
        )}
        {feedback === 'retry' && (
          <span className={styles.feedbackRetry}>{t('wp.tryAgain')}</span>
        )}
        {feedback === 'hint' && !advancing.current && (
          <span className={styles.feedbackHint}>{t('wp.letterHint')}</span>
        )}
        {feedback === 'hint' && advancing.current && (
          <span className={styles.feedbackHint}>
            {t('wp.hint', { word: lo.lemma })}
          </span>
        )}
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.clearBtn}
          onClick={clearAll}
          disabled={locked || slots.every((s, i) => !s || lockedSlots.has(i))}
          data-clear
        >
          {t('wp.clear')}
        </button>
        <button
          type="button"
          className={styles.hintBtn}
          onClick={onHint}
          disabled={locked || advancing.current}
          data-hint
          title={hintCostLabel}
        >
          {hintCostLabel}
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={runCheck}
          disabled={locked || !allFilled}
          data-check
        >
          {t('wp.check')}
        </button>
      </div>
    </div>
  );
}
