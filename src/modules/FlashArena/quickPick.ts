import type { LearningObject } from '../Content/types';
import { getLevelParams } from '../Content/levelDifficulty';
import { getTopicLoById, getTopicLos } from '../Content';
import {
  pickSessionTargets,
  pickSmartSessionTargets,
} from '../Mastery';
import { ROUND_SIZE } from '../Rewards/rewards';

export const SMART_TOPIC_ID = 'smart';
export const SMART_WEAK_BIAS = 0.85;

export interface QuickPickQuestion {
  target: LearningObject;
  /** N lemma options including target, shuffled (level-driven) */
  options: LearningObject[];
  /** Real content topic (never 'smart') — used for distractors + mastery */
  topicId: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Build one Quick Pick / Word Choice question: show image → pick German lemma */
export function buildQuestion(
  target: LearningObject,
  topicId = 'tiere',
  optionCount = 4,
): QuickPickQuestion {
  const need = Math.max(1, optionCount - 1);
  const ids = [...target.distractors];
  const pool = getTopicLos(topicId).filter((t) => t.id !== target.id);
  while (ids.length < need) {
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (pick && !ids.includes(pick.id)) ids.push(pick.id);
  }
  const distractors: LearningObject[] = [];
  for (const id of ids) {
    if (distractors.length >= need) break;
    const lo = getTopicLoById(topicId, id);
    if (lo && !distractors.some((d) => d.id === lo.id)) distractors.push(lo);
  }
  for (const lo of shuffle(pool)) {
    if (distractors.length >= need) break;
    if (!distractors.some((d) => d.id === lo.id)) distractors.push(lo);
  }
  let options = shuffle([target, ...distractors]).slice(0, optionCount);
  if (!options.find((o) => o.id === target.id)) {
    options = [target, ...options.slice(1)].slice(0, optionCount);
  }
  return { target, options: shuffle(options), topicId };
}

/**
 * Session — show image, pick correct German word. Size from level params.
 * Pass topicId `'smart'` for mixed Smart Training (all playable topics, bias 0.85).
 */
export function buildSession(
  count = ROUND_SIZE,
  topicId = 'tiere',
  level = 1,
): QuickPickQuestion[] {
  const params = getLevelParams(level);
  const roundSize = count > 0 ? count : params.roundSize;

  if (topicId === SMART_TOPIC_ID) {
    return buildSmartQuickSession(roundSize, level);
  }

  let targets;
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
  while (targets.length < roundSize) {
    const next = shuffle(getTopicLos(topicId)).find(
      (t) => t.id !== targets[targets.length - 1]?.id,
    );
    if (!next) break;
    targets.push(next);
  }
  return targets.map((t) => buildQuestion(t, topicId, params.optionCount));
}

/** Mixed Quick Pick across playable topics, preferring weak/due words. */
function buildSmartQuickSession(
  roundSize: number,
  level: number,
): QuickPickQuestion[] {
  const params = getLevelParams(level);
  const tagged = pickSmartSessionTargets(roundSize, SMART_WEAK_BIAS);
  if (!tagged.length) {
    // Fallback: single-topic tiere if somehow empty
    return buildSession(roundSize, 'tiere', level);
  }
  while (tagged.length < roundSize) {
    const next = pickSmartSessionTargets(1, SMART_WEAK_BIAS)[0];
    if (!next) break;
    if (next.lo.id === tagged[tagged.length - 1]?.lo.id) continue;
    tagged.push(next);
  }
  return tagged.map(({ lo, topicId }) =>
    buildQuestion(lo, topicId, params.optionCount),
  );
}
