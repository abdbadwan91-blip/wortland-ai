/** Per-word spaced-repetition / mastery record (MVP). */

export type MasteryResult = 'good' | 'again';

export interface WordMastery {
  loId: string;
  topicId: string;
  /** 0–100 mastery score */
  score: number;
  /** SM-2-ish ease factor (typically ~1.3–2.8) */
  ease: number;
  /** Days until next review */
  intervalDays: number;
  /** ISO timestamp when due */
  nextReviewAt: string;
  lastResult: MasteryResult;
  /** Total review attempts recorded */
  reviews: number;
}

export type MasteryStore = Record<string, WordMastery>;

export const MASTERY_STORAGE_KEY = 'wortland.mastery.v1';
export const WEAK_SCORE_THRESHOLD = 60;
export const DEFAULT_EASE = 2.5;
