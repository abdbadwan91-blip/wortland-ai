import type { LearningObject } from '../Content/types';
import { getTopicLos } from '../Content';
import { extrasFor } from '../Content/cardExtras';
import {
  BADGE_SCORE,
  MAP_PASS_SCORE,
  type RoundRewards,
} from '../Rewards/rewards';

export const BUILD_ROUND_SIZE = 8;

export interface BuildChip {
  /** Unique instance id (handles duplicate words) */
  id: string;
  text: string;
}

export interface BuildRound {
  lo: LearningObject;
  /** Original example sentence (with trailing punctuation) */
  example: string;
  /** Correct token order (punctuation stripped) */
  answer: string[];
  /** Shuffled chip bank */
  bank: BuildChip[];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Strip trailing . ! ? from a token for chip display / matching. */
export function stripPunct(token: string): string {
  return token.replace(/[.!?]+$/u, '').trim();
}

/** Tokenize an example sentence into chip texts (punctuation stripped). */
export function tokenizeExample(example: string): string[] {
  return example
    .trim()
    .split(/\s+/u)
    .map(stripPunct)
    .filter(Boolean);
}

function isAlreadyCorrect(bank: BuildChip[], answer: string[]): boolean {
  if (bank.length !== answer.length) return false;
  return bank.every((c, i) => c.text === answer[i]);
}

function toBank(tokens: string[]): BuildChip[] {
  let bank = tokens.map((text, i) => ({ id: `c${i}-${text}`, text }));
  bank = shuffle(bank);
  // Avoid starting already solved (rare with short sentences)
  let guard = 0;
  while (isAlreadyCorrect(bank, tokens) && tokens.length > 1 && guard < 8) {
    bank = shuffle(bank);
    guard += 1;
  }
  return bank;
}

/** LOs in topic that have a usable example sentence (≥2 words). */
export function getBuildPool(topicId: string): LearningObject[] {
  return getTopicLos(topicId).filter((lo) => {
    const example = (lo.example || extrasFor(lo.id).example || '').trim();
    return tokenizeExample(example).length >= 2;
  });
}

export function buildRound(lo: LearningObject): BuildRound {
  const example = (lo.example || extrasFor(lo.id).example || '').trim();
  const answer = tokenizeExample(example);
  return {
    lo,
    example,
    answer,
    bank: toBank(answer),
  };
}

/**
 * ~8 rounds from topic LOs that have cardExtras.example.
 * Prefers unique targets; pads if pool is smaller.
 */
export function buildSession(
  count = BUILD_ROUND_SIZE,
  topicId = 'tiere',
): BuildRound[] {
  const pool = shuffle(getBuildPool(topicId));
  if (pool.length === 0) return [];

  const targets: LearningObject[] = pool.slice(0, Math.min(count, pool.length));
  while (targets.length < count) {
    const next = shuffle(getBuildPool(topicId)).find(
      (t) => t.id !== targets[targets.length - 1]?.id,
    );
    if (!next) break;
    targets.push(next);
  }
  return targets.map(buildRound);
}

/** Compare placed chip texts to expected answer (order-sensitive). */
export function checkBuild(placed: string[], answer: string[]): boolean {
  if (placed.length !== answer.length) return false;
  return placed.every((t, i) => t === answer[i]);
}

/** Rebuild display sentence with a trailing period. */
export function formatBuiltSentence(tokens: string[]): string {
  if (!tokens.length) return '';
  return `${tokens.join(' ')}.`;
}

export function buildStars(correct: number, total: number): number {
  if (total <= 0) return 0;
  const ratio = correct / total;
  if (ratio >= 0.9) return 3;
  if (ratio >= 0.7) return 2;
  if (ratio >= 0.4) return 1;
  return 0;
}

export function calcBuildRewards(
  correct: number,
  total = BUILD_ROUND_SIZE,
): RoundRewards {
  const stars = buildStars(correct, total);
  const xp = 12 + correct * 6 + (stars >= 2 ? 18 : 0);
  const coins = 6 + correct * 2 + (stars === 3 ? 12 : 0);
  const badgeId = correct >= BADGE_SCORE ? 'satzbauer' : null;
  const mapAdvance = correct >= MAP_PASS_SCORE;
  return { xp, coins, stars, badgeId, mapAdvance };
}

export { MAP_PASS_SCORE };
