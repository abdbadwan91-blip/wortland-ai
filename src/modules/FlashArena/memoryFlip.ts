import type { LearningObject } from '../Content/types';
import { getTopicLos } from '../Content';

export const MEMORY_PAIR_COUNT = 6;

export type MemoryCardKind = 'image' | 'word';

export interface MemoryCard {
  /** Unique card instance id */
  id: string;
  loId: string;
  kind: MemoryCardKind;
  lemma: string;
  article: LearningObject['article'];
  image: string;
  imageKind: LearningObject['imageKind'];
}

export interface MemoryBoard {
  cards: MemoryCard[];
  pairCount: number;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Prefer LOs with generated images; fall back to emoji pool. */
function pickLos(topicId: string, count: number): LearningObject[] {
  const pool = getTopicLos(topicId);
  const withUrl = shuffle(pool.filter((lo) => lo.imageKind === 'url'));
  const rest = shuffle(pool.filter((lo) => lo.imageKind !== 'url'));
  const picked: LearningObject[] = [];
  const seen = new Set<string>();
  for (const lo of [...withUrl, ...rest]) {
    if (seen.has(lo.id)) continue;
    seen.add(lo.id);
    picked.push(lo);
    if (picked.length >= count) break;
  }
  return picked;
}

function toCards(los: LearningObject[]): MemoryCard[] {
  const cards: MemoryCard[] = [];
  for (const lo of los) {
    cards.push({
      id: `${lo.id}-image`,
      loId: lo.id,
      kind: 'image',
      lemma: lo.lemma,
      article: lo.article,
      image: lo.image,
      imageKind: lo.imageKind,
    });
    cards.push({
      id: `${lo.id}-word`,
      loId: lo.id,
      kind: 'word',
      lemma: lo.lemma,
      article: lo.article,
      image: lo.image,
      imageKind: lo.imageKind,
    });
  }
  return shuffle(cards);
}

/**
 * Build a Memory Flip board: N picture ↔ word pairs (2N cards), shuffled.
 */
export function buildBoard(
  topicId = 'tiere',
  pairCount = MEMORY_PAIR_COUNT,
): MemoryBoard {
  const los = pickLos(topicId, pairCount);
  return {
    cards: toCards(los),
    pairCount: los.length,
  };
}

/** Perfect (minimum) moves for a board = pairCount. Soft scoring uses moves. */
export function memoryStars(moves: number, pairCount: number): number {
  if (pairCount <= 0) return 0;
  // Ideal ≈ pairCount; good ≤ 1.6×; ok ≤ 2.4×
  if (moves <= pairCount * 1.25) return 3;
  if (moves <= pairCount * 1.75) return 2;
  if (moves <= pairCount * 2.5) return 1;
  return 0;
}

export function calcMemoryRewards(moves: number, pairCount: number) {
  const stars = memoryStars(moves, pairCount);
  const xp = 15 + pairCount * 5 + stars * 8;
  const coins = 8 + pairCount * 2 + (stars === 3 ? 12 : stars * 3);
  return { xp, coins, stars, badgeId: stars >= 2 ? 'memory-champ' : null as string | null, mapAdvance: stars >= 2 };
}
