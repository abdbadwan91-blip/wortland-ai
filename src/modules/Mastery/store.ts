import {
  DEFAULT_EASE,
  MASTERY_STORAGE_KEY,
  WEAK_SCORE_THRESHOLD,
  type MasteryStore,
  type WordMastery,
} from './types';

const INTERVAL_LADDER = [1, 2, 4, 7];

function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function daysFromNow(days: number): string {
  const d = new Date();
  d.setTime(d.getTime() + Math.max(0, days) * 24 * 60 * 60 * 1000);
  return d.toISOString();
}

function soonIso(minutes = 30): string {
  const d = new Date();
  d.setTime(d.getTime() + minutes * 60 * 1000);
  return d.toISOString();
}

function nextInterval(prevDays: number, correct: boolean): number {
  if (!correct) return 1;
  if (prevDays <= 0) return 1;
  const idx = INTERVAL_LADDER.findIndex((d) => d >= prevDays);
  if (idx < 0) return INTERVAL_LADDER[INTERVAL_LADDER.length - 1]!;
  if (INTERVAL_LADDER[idx] === prevDays && idx + 1 < INTERVAL_LADDER.length) {
    return INTERVAL_LADDER[idx + 1]!;
  }
  if (idx + 1 < INTERVAL_LADDER.length && prevDays < INTERVAL_LADDER[idx]!) {
    return INTERVAL_LADDER[idx]!;
  }
  // Grow toward next ladder step or stay at 7+
  if (idx >= 0 && idx + 1 < INTERVAL_LADDER.length) {
    return INTERVAL_LADDER[idx + 1]!;
  }
  return Math.max(7, Math.round(prevDays * 1.5));
}

export function loadMastery(): MasteryStore {
  try {
    const raw = localStorage.getItem(MASTERY_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as MasteryStore;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveMastery(store: MasteryStore): void {
  localStorage.setItem(MASTERY_STORAGE_KEY, JSON.stringify(store));
}

export function clearMastery(): void {
  localStorage.removeItem(MASTERY_STORAGE_KEY);
}

export function getMastery(loId: string): WordMastery | undefined {
  return loadMastery()[loId];
}

function defaultEntry(topicId: string, loId: string): WordMastery {
  return {
    loId,
    topicId,
    score: 0,
    ease: DEFAULT_EASE,
    intervalDays: 0,
    nextReviewAt: new Date().toISOString(),
    lastResult: 'again',
    reviews: 0,
  };
}

/**
 * Record one answer for an LO. Correct: +10 score (cap 100), ease up, interval 1→2→4→7.
 * Wrong: −15 score (floor 0), interval reset to 1 day, next review soon.
 */
export function recordResult(
  topicId: string,
  loId: string,
  correct: boolean,
): WordMastery {
  const store = loadMastery();
  const prev = store[loId] ?? defaultEntry(topicId, loId);

  let score: number;
  let ease: number;
  let intervalDays: number;
  let nextReviewAt: string;

  if (correct) {
    score = clampScore(prev.score + 10);
    ease = Math.min(2.8, Math.round((prev.ease + 0.1) * 100) / 100);
    intervalDays = nextInterval(prev.intervalDays, true);
    nextReviewAt = daysFromNow(intervalDays);
  } else {
    score = clampScore(prev.score - 15);
    ease = Math.max(1.3, Math.round((prev.ease - 0.2) * 100) / 100);
    intervalDays = 1;
    nextReviewAt = soonIso(30);
  }

  const entry: WordMastery = {
    loId,
    topicId,
    score,
    ease,
    intervalDays,
    nextReviewAt,
    lastResult: correct ? 'good' : 'again',
    reviews: prev.reviews + 1,
  };

  store[loId] = entry;
  saveMastery(store);
  return entry;
}

export function getMasterySummary(now = new Date()): {
  tracked: number;
  weak: number;
  due: number;
} {
  const store = loadMastery();
  const entries = Object.values(store);
  const nowMs = now.getTime();
  let weak = 0;
  let due = 0;
  for (const e of entries) {
    if (e.score < WEAK_SCORE_THRESHOLD) weak += 1;
    if (new Date(e.nextReviewAt).getTime() <= nowMs) due += 1;
  }
  return { tracked: entries.length, weak, due };
}

export function listWeak(topicId?: string): WordMastery[] {
  return Object.values(loadMastery()).filter(
    (e) =>
      e.score < WEAK_SCORE_THRESHOLD &&
      (topicId == null || e.topicId === topicId),
  );
}

/** Average mastery score (0–100) for tracked words in a topic, or 0 if none. */
export function getTopicAverageScore(topicId: string): number {
  const entries = Object.values(loadMastery()).filter((e) => e.topicId === topicId);
  if (entries.length === 0) return 0;
  const sum = entries.reduce((acc, e) => acc + e.score, 0);
  return Math.round(sum / entries.length);
}

/**
 * Count of tracked words that are weak (score < threshold) or due for review.
 * Used by Smart Training home card.
 */
export function getWeakWordCount(now = new Date()): number {
  const store = loadMastery();
  const nowMs = now.getTime();
  let n = 0;
  for (const e of Object.values(store)) {
    if (
      e.score < WEAK_SCORE_THRESHOLD ||
      new Date(e.nextReviewAt).getTime() <= nowMs
    ) {
      n += 1;
    }
  }
  return n;
}

/** Unique topic ids that currently have at least one weak or due word. */
export function listWeakTopics(now = new Date()): string[] {
  const store = loadMastery();
  const nowMs = now.getTime();
  const topics = new Set<string>();
  for (const e of Object.values(store)) {
    if (
      e.score < WEAK_SCORE_THRESHOLD ||
      new Date(e.nextReviewAt).getTime() <= nowMs
    ) {
      topics.add(e.topicId);
    }
  }
  return [...topics];
}
