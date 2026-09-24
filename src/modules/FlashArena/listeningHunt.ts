import type { LearningObject } from '../Content/types';
import { getLevelParams } from '../Content/levelDifficulty';
import { getTopicLoById, getTopicLos } from '../Content';
import { pickSessionTargets } from '../Mastery';
import { ROUND_SIZE } from '../Rewards/rewards';

export interface ListeningHuntQuestion {
  target: LearningObject;
  /** N image options including target, shuffled (level-driven) */
  options: LearningObject[];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Build one Listening Hunt question: hear German lemma → pick matching image */
export function buildQuestion(
  target: LearningObject,
  topicId = 'tiere',
  optionCount = 4,
): ListeningHuntQuestion {
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
  return { target, options: shuffle(options) };
}

/**
 * Listening Hunt session — hear word, pick image.
 * Round size, optionCount, weak bias from level params.
 */
export function buildSession(
  count = ROUND_SIZE,
  topicId = 'tiere',
  level = 1,
): ListeningHuntQuestion[] {
  const params = getLevelParams(level);
  const roundSize = count > 0 ? count : params.roundSize;
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
