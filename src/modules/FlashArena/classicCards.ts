import type { LearningObject } from '../Content/types';
import { getTopicLos } from '../Content';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Classic Cards deck — full topic pool shuffled (study mode, not timed quiz).
 */
export function buildDeck(topicId = 'tiere'): LearningObject[] {
  return shuffle(getTopicLos(topicId));
}
