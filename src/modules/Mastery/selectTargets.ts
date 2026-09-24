import { getTopicLos } from '../Content';
import type { LearningObject } from '../Content/types';
import { getMastery } from './store';
import { WEAK_SCORE_THRESHOLD } from './types';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isDueOrWeak(loId: string, nowMs: number): boolean {
  const m = getMastery(loId);
  if (!m) return true; // unseen → treat as needing practice
  if (m.score < WEAK_SCORE_THRESHOLD) return true;
  return new Date(m.nextReviewAt).getTime() <= nowMs;
}

/**
 * Prefer due / weak (score < 60 or nextReviewAt ≤ now), then fill with random LOs.
 * Unseen words count as due. Avoids immediate consecutive duplicates when padding.
 *
 * @param preferWeakBias 0–1 fraction of slots reserved for weak/due when available
 *   (default 1 = fill all priority first — legacy behaviour).
 */
export function pickSessionTargets(
  topicId: string,
  count: number,
  preferWeakBias?: number,
): LearningObject[] {
  const pool = getTopicLos(topicId);
  if (pool.length === 0 || count <= 0) return [];

  const nowMs = Date.now();
  const priority = shuffle(pool.filter((lo) => isDueOrWeak(lo.id, nowMs)));
  const rest = shuffle(pool.filter((lo) => !isDueOrWeak(lo.id, nowMs)));

  const bias =
    preferWeakBias == null
      ? 1
      : Math.min(1, Math.max(0, preferWeakBias));
  const weakSlots = Math.min(count, Math.ceil(count * bias));

  const picked: LearningObject[] = [];
  const seen = new Set<string>();

  for (const lo of priority) {
    if (picked.length >= weakSlots) break;
    if (seen.has(lo.id)) continue;
    seen.add(lo.id);
    picked.push(lo);
  }

  for (const lo of [...rest, ...priority]) {
    if (picked.length >= count) break;
    if (seen.has(lo.id)) continue;
    seen.add(lo.id);
    picked.push(lo);
  }

  // Pad if pool smaller than count (allow reshuffles, avoid consecutive dup)
  while (picked.length < count) {
    const next = shuffle(pool).find(
      (t) => t.id !== picked[picked.length - 1]?.id,
    );
    if (!next) break;
    picked.push(next);
  }
  return picked;
}

/** All unlocked playable topic ids (content pools exist). */
export const PLAYABLE_TOPIC_IDS = [
  'tiere',
  'essen',
  'farben',
  'familie',
  'zuhause',
  'schule',
  'zahlen',
  'kleidung',
  'koerper',
  'wetter',
  'transport',
  'natur',
  'gesundheit',
  'arbeit',
] as const;

export type PlayableTopicId = (typeof PLAYABLE_TOPIC_IDS)[number];

export interface TaggedLearningObject {
  lo: LearningObject;
  topicId: string;
}

/** Merge LOs from every playable topic, tagged with topicId. */
export function getPlayableTaggedLos(): TaggedLearningObject[] {
  const out: TaggedLearningObject[] = [];
  for (const topicId of PLAYABLE_TOPIC_IDS) {
    for (const lo of getTopicLos(topicId)) {
      out.push({ lo, topicId });
    }
  }
  return out;
}

/**
 * Smart Training: pick across all playable topics with high weak/due bias.
 * Returns tagged LOs so callers can record mastery under the real topicId.
 */
export function pickSmartSessionTargets(
  count: number,
  preferWeakBias = 0.85,
): TaggedLearningObject[] {
  const pool = getPlayableTaggedLos();
  if (pool.length === 0 || count <= 0) return [];

  const nowMs = Date.now();
  const priority = shuffle(pool.filter((t) => isDueOrWeak(t.lo.id, nowMs)));
  const rest = shuffle(pool.filter((t) => !isDueOrWeak(t.lo.id, nowMs)));

  const bias = Math.min(1, Math.max(0, preferWeakBias));
  const weakSlots = Math.min(count, Math.ceil(count * bias));

  const picked: TaggedLearningObject[] = [];
  const seen = new Set<string>();

  for (const item of priority) {
    if (picked.length >= weakSlots) break;
    if (seen.has(item.lo.id)) continue;
    seen.add(item.lo.id);
    picked.push(item);
  }

  for (const item of [...rest, ...priority]) {
    if (picked.length >= count) break;
    if (seen.has(item.lo.id)) continue;
    seen.add(item.lo.id);
    picked.push(item);
  }

  while (picked.length < count) {
    const next = shuffle(pool).find(
      (t) => t.lo.id !== picked[picked.length - 1]?.lo.id,
    );
    if (!next) break;
    picked.push(next);
  }
  return picked;
}

/** Convenience: build a smart-biased target list (untagged LOs only). */
export function buildSmartSession(
  count: number,
  preferWeakBias = 0.85,
): LearningObject[] {
  return pickSmartSessionTargets(count, preferWeakBias).map((t) => t.lo);
}
