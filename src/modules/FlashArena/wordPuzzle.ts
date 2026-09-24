import type { LearningObject } from '../Content/types';
import { getLevelParams } from '../Content/levelDifficulty';
import { getTopicLos } from '../Content';
import { pickSessionTargets } from '../Mastery';
import { ROUND_SIZE } from '../Rewards/rewards';

export interface LetterTile {
  /** Unique instance id (handles duplicate letters) */
  id: string;
  letter: string;
}

export interface WordPuzzleRound {
  target: LearningObject;
  /** Lemma letters only (no article), case-sensitive as stored */
  answer: string[];
  /** Shuffled letter bank */
  bank: LetterTile[];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Split lemma into letter tiles (Unicode-safe for äöüß). */
export function lemmaLetters(lemma: string): string[] {
  return Array.from(lemma.trim()).filter((ch) => ch.length > 0);
}

function isAlreadyCorrect(bank: LetterTile[], answer: string[]): boolean {
  if (bank.length !== answer.length) return false;
  return bank.every((t, i) => t.letter === answer[i]);
}

export function scrambleLetters(letters: string[]): LetterTile[] {
  let bank = letters.map((letter, i) => ({ id: `l${i}-${letter}`, letter }));
  bank = shuffle(bank);
  let guard = 0;
  while (isAlreadyCorrect(bank, letters) && letters.length > 1 && guard < 10) {
    bank = shuffle(bank);
    guard += 1;
  }
  return bank;
}

export function buildRound(target: LearningObject): WordPuzzleRound {
  const answer = lemmaLetters(target.lemma);
  return {
    target,
    answer,
    bank: scrambleLetters(answer),
  };
}

/** Compare placed letters to expected answer (order + case sensitive). */
export function checkPuzzle(placed: string[], answer: string[]): boolean {
  if (placed.length !== answer.length) return false;
  return placed.every((ch, i) => ch === answer[i]);
}

/**
 * Word Puzzle session — image → rebuild lemma from scrambled letter tiles.
 * Round size + weak bias from level params.
 */
export function buildSession(
  count = ROUND_SIZE,
  topicId = 'tiere',
  level = 1,
): WordPuzzleRound[] {
  const params = getLevelParams(level);
  const roundSize = count > 0 ? count : params.roundSize;
  let targets: LearningObject[];
  try {
    targets = pickSessionTargets(topicId, roundSize, params.preferWeakBias);
  } catch {
    targets = shuffle(getTopicLos(topicId)).slice(
      0,
      Math.min(roundSize, getTopicLos(topicId).length),
    );
  }
  if (!targets.length) {
    targets = shuffle(getTopicLos(topicId)).slice(
      0,
      Math.min(roundSize, getTopicLos(topicId).length),
    );
  }
  // Prefer lemmas with ≥2 letters
  targets = targets.filter((t) => lemmaLetters(t.lemma).length >= 2);
  while (targets.length < roundSize) {
    const next = shuffle(getTopicLos(topicId)).find(
      (t) =>
        t.id !== targets[targets.length - 1]?.id &&
        lemmaLetters(t.lemma).length >= 2,
    );
    if (!next) break;
    targets.push(next);
  }
  return targets.map(buildRound);
}

/** Index of first slot that is empty or wrong — for soft letter reveal. */
export function nextHintIndex(
  slots: (string | null)[],
  answer: string[],
): number {
  for (let i = 0; i < answer.length; i++) {
    if (slots[i] !== answer[i]) return i;
  }
  return -1;
}
