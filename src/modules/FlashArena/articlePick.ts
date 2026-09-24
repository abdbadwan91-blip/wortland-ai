import type { Article, LearningObject } from '../Content/types';
import { getLevelParams } from '../Content/levelDifficulty';
import { getTopicLos } from '../Content';
import { pickSessionTargets } from '../Mastery';
import { ROUND_SIZE } from '../Rewards/rewards';

export const ARTICLE_OPTIONS: Article[] = ['der', 'die', 'das'];

export interface ArticlePickQuestion {
  target: LearningObject;
  /** Always der / die / das */
  options: Article[];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildQuestion(target: LearningObject): ArticlePickQuestion {
  return { target, options: [...ARTICLE_OPTIONS] };
}

/**
 * Session — show image + "___ Lemma", pick der/die/das. Round size from level.
 */
export function buildSession(
  count = ROUND_SIZE,
  topicId = 'tiere',
  level = 1,
): ArticlePickQuestion[] {
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
  return targets.map(buildQuestion);
}
