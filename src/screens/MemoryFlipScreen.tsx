import { useCallback, useEffect, useMemo, useRef, useState, type SyntheticEvent } from 'react';
import { useApp } from '../modules/Auth/AppContext';
import {
  buildBoard,
  type MemoryCard,
} from '../modules/FlashArena/memoryFlip';
import { getMemoryPairCount } from '../modules/Content/levelDifficulty';
import { assetUrl } from '../modules/Content/assetUrl';
import { speakGerman, stopSpeech, warmSpeechVoices } from '../modules/Audio/speech';
import { recordResult } from '../modules/Mastery';
import styles from './MemoryFlipScreen.module.css';

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

const CARD_BACK_SRC = assetUrl('ui/memory/card-back.png');

function spokenPhrase(card: MemoryCard): string {
  return `${card.article} ${card.lemma}`.trim();
}

export interface MemoryFlipStats {
  moves: number;
  matched: number;
  pairCount: number;
  elapsedMs: number;
  sessionXp: number;
}

interface Props {
  onFinish: (stats: MemoryFlipStats) => void;
}

export function MemoryFlipScreen({ onFinish }: Props) {
  const { t, setScreen, selectedTopic, selectedLevel } = useApp();
  const pairTarget = useMemo(() => getMemoryPairCount(selectedLevel), [selectedLevel]);
  const board = useMemo(
    () => buildBoard(selectedTopic, pairTarget),
    [selectedTopic, pairTarget],
  );

  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [matchedLos, setMatchedLos] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState<'match' | 'miss' | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [elapsedMs, setElapsedMs] = useState(0);
  const startedAt = useRef(Date.now());
  const finishing = useRef(false);

  useEffect(() => {
    warmSpeechVoices();
    startedAt.current = Date.now();
    const tick = window.setInterval(() => {
      setElapsedMs(Date.now() - startedAt.current);
    }, 500);
    return () => {
      window.clearInterval(tick);
      stopSpeech();
    };
  }, []);

  const pairCount = board.pairCount;
  const matchedCount = matchedLos.size;

  useEffect(() => {
    if (finishing.current) return;
    if (pairCount > 0 && matchedLos.size >= pairCount) {
      finishing.current = true;
      const finalElapsed = Date.now() - startedAt.current;
      window.setTimeout(() => {
        onFinish({
          moves,
          matched: matchedLos.size,
          pairCount,
          elapsedMs: finalElapsed,
          sessionXp,
        });
      }, 700);
    }
  }, [matchedLos, pairCount, moves, sessionXp, onFinish]);

  const replayCard = useCallback((card: MemoryCard, e?: SyntheticEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    speakGerman(spokenPhrase(card), 'normal');
  }, []);

  const onCardTap = useCallback(
    (card: MemoryCard) => {
      if (matchedIds.has(card.id)) return;
      if (locked) return;
      if (flippedIds.includes(card.id)) return;
      if (flippedIds.length >= 2) return;

      const nextFlipped = [...flippedIds, card.id];
      setFlippedIds(nextFlipped);
      setFeedback(null);

      // Speak German (article + lemma) whenever any card flips face-up
      speakGerman(spokenPhrase(card), 'normal');

      if (nextFlipped.length < 2) return;

      const a = board.cards.find((c) => c.id === nextFlipped[0]);
      const b = board.cards.find((c) => c.id === nextFlipped[1]);
      if (!a || !b) return;

      setMoves((m) => m + 1);
      setLocked(true);

      const isMatch = a.loId === b.loId && a.kind !== b.kind;

      if (isMatch) {
        recordResult(selectedTopic, a.loId, true);
        setFeedback('match');
        // Already spoke on the second flip — skip a second utterance to avoid double-speak
        const gained = 5;
        setSessionXp((x) => x + gained);
        setMatchedIds((prev) => {
          const n = new Set(prev);
          n.add(a.id);
          n.add(b.id);
          return n;
        });
        setMatchedLos((prev) => {
          const n = new Set(prev);
          n.add(a.loId);
          return n;
        });
        window.setTimeout(() => {
          setFlippedIds([]);
          setLocked(false);
          setFeedback(null);
        }, 650);
      } else {
        setFeedback('miss');
        window.setTimeout(() => {
          setFlippedIds([]);
          setLocked(false);
          setFeedback(null);
        }, 850);
      }
    },
    [locked, matchedIds, flippedIds, board.cards, selectedTopic],
  );

  const pct = pairCount > 0 ? (matchedCount / pairCount) * 100 : 0;
  const secs = Math.floor(elapsedMs / 1000);
  const timeLabel = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;

  return (
    <div className={`screen fade-in ${styles.wrap}`} data-memory-flip>
      <div className={styles.topBar}>
        <button
          type="button"
          className="back-chip"
          onClick={() => {
            stopSpeech();
            setScreen('gameModes');
          }}
        >
          ← {t('mf.back')}
        </button>
        <span className={styles.xpChip} dir="ltr">
          ⭐ +{sessionXp}
        </span>
      </div>

      <div className={styles.hud}>
        <div className={styles.progress}>
          <span className={styles.progressLabel}>
            {t('mf.matched', { n: matchedCount, total: pairCount })}
          </span>
          <div className={styles.track} aria-hidden>
            <div className={styles.fill} style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className={styles.stats} dir="ltr">
          <span className={styles.statChip} data-moves>
            🔄 {t('mf.moves', { n: moves })}
          </span>
          <span className={styles.statChip} data-time>
            ⏱️ {timeLabel}
          </span>
        </div>
      </div>

      <p className={styles.hint}>{t('mf.hint')}</p>

      <div
        className={styles.grid}
        role="list"
        aria-label={t('mf.title')}
        data-pairs={pairCount}
      >
        {board.cards.map((card) => {
          const isMatched = matchedIds.has(card.id);
          const isFlipped = isMatched || flippedIds.includes(card.id);
          const faceUp = isFlipped;

          return (
            <button
              key={card.id}
              type="button"
              role="listitem"
              disabled={locked && !faceUp}
              className={`${styles.card} ${faceUp ? styles.faceUp : styles.faceDown} ${
                isMatched ? styles.matched : ''
              }`}
              onClick={() => onCardTap(card)}
              data-card={card.id}
              data-loid={card.loId}
              data-kind={card.kind}
              data-flipped={faceUp ? '1' : '0'}
              data-matched={isMatched ? '1' : '0'}
              aria-label={
                faceUp
                  ? card.kind === 'word'
                    ? spokenPhrase(card)
                    : t('mf.pictureOf', { word: spokenPhrase(card) })
                  : t('mf.hiddenCard')
              }
            >
              <span className={styles.cardInner}>
                <span className={`${styles.face} ${styles.back}`}>
                  <img
                    className={styles.backArt}
                    src={CARD_BACK_SRC}
                    alt=""
                    draggable={false}
                    aria-hidden
                  />
                </span>
                <span className={`${styles.face} ${styles.front}`}>
                  {card.kind === 'image' ? (
                    card.imageKind === 'url' && !imageErrors[card.id] ? (
                      <span className={styles.imageFrame}>
                        <img
                          className={styles.image}
                          src={card.image}
                          alt=""
                          onError={() =>
                            setImageErrors((prev) => ({
                              ...prev,
                              [card.id]: true,
                            }))
                          }
                        />
                      </span>
                    ) : (
                      <span className={styles.emoji} aria-hidden>
                        {card.imageKind === 'emoji'
                          ? card.image
                          : FALLBACK_EMOJI[card.loId] ?? '🐾'}
                      </span>
                    )
                  ) : (
                    <span className={styles.wordFace}>
                      <span className={styles.article}>{card.article}</span>
                      <span className={styles.lemma}>{card.lemma}</span>
                    </span>
                  )}
                  {faceUp && (
                    <span
                      className={styles.speakBtn}
                      role="img"
                      aria-label={t('mf.replay')}
                      data-memory-speak
                      onClick={(e) => replayCard(card, e)}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      🔊
                    </span>
                  )}
                  {isMatched && (
                    <span className={styles.checkMark} aria-hidden>
                      ✓
                    </span>
                  )}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className={styles.feedback} role="status" aria-live="polite">
        {feedback === 'match' && (
          <span className={styles.feedbackOk}>{t('mf.match')}</span>
        )}
        {feedback === 'miss' && (
          <span className={styles.feedbackMiss}>{t('mf.tryAgain')}</span>
        )}
      </div>

      <div className={styles.spacer} />
    </div>
  );
}
