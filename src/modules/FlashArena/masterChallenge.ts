import type { Article, LearningObject } from '../Content/types';
import { getTopicLos } from '../Content';
import { pickSessionTargets } from '../Mastery';
import { MASTER_ROUND_SIZE } from '../Rewards/rewards';
import {
  buildQuestion as buildPictureQuestion,
  type PictureQuestion,
} from './pictureMatch';
import {
  buildQuestion as buildQuickQuestion,
  type QuickPickQuestion,
} from './quickPick';
import {
  buildQuestion as buildArticleQuestion,
  type ArticlePickQuestion,
} from './articlePick';

export type MasterKind = 'picture' | 'quick' | 'article';

export type MasterQuestion =
  | ({ kind: 'picture' } & PictureQuestion)
  | ({ kind: 'quick' } & QuickPickQuestion)
  | ({ kind: 'article' } & ArticlePickQuestion);

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Prefer unique targets; pad if topic pool is small. */
function pickTargets(topicId: string, count: number): LearningObject[] {
  let targets: LearningObject[];
  try {
    targets = pickSessionTargets(topicId, count);
  } catch {
    targets = shuffle(getTopicLos(topicId)).slice(
      0,
      Math.min(count, getTopicLos(topicId).length),
    );
  }
  if (!targets.length) {
    targets = shuffle(getTopicLos(topicId)).slice(
      0,
      Math.min(count, getTopicLos(topicId).length),
    );
  }
  while (targets.length < count) {
    const next = shuffle(getTopicLos(topicId)).find(
      (t) => t.id !== targets[targets.length - 1]?.id,
    );
    if (!next) break;
    targets.push(next);
  }
  return targets;
}

/**
 * Master Challenge session: ~4 Picture + ~4 Quick + ~4 Article, shuffled.
 * Uses existing builders for each variant.
 */
export function buildMasterSession(
  count = MASTER_ROUND_SIZE,
  topicId = 'tiere',
): MasterQuestion[] {
  const nPic = Math.floor(count / 3);
  const nQuick = Math.floor(count / 3);
  const nArt = count - nPic - nQuick;

  const targets = pickTargets(topicId, count);
  const kinds: MasterKind[] = [
    ...Array(nPic).fill('picture'),
    ...Array(nQuick).fill('quick'),
    ...Array(nArt).fill('article'),
  ] as MasterKind[];

  const shuffledKinds = shuffle(kinds);
  const questions: MasterQuestion[] = shuffledKinds.map((kind, i) => {
    const target = targets[i % targets.length]!;
    if (kind === 'picture') {
      return { kind, ...buildPictureQuestion(target, topicId) };
    }
    if (kind === 'quick') {
      return { kind, ...buildQuickQuestion(target, topicId) };
    }
    return { kind, ...buildArticleQuestion(target) };
  });

  return questions;
}

export type { Article, LearningObject };
