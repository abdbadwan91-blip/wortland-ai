import { getGameModes, type GameModeId } from '../Content/cefr';

const TOPIC_ORDER = [
  'tiere', 'essen', 'zuhause', 'schule', 'familie', 'farben', 'kleidung',
  'koerper', 'wetter', 'transport', 'gesundheit', 'arbeit', 'natur', 'zahlen',
];

/**
 * Pick a varied, level-appropriate mission for the journey.
 * The same level does not force every topic into the same game mode.
 */
export function getJourneyMode(level: number, topicId: string): GameModeId {
  const unlocked = getGameModes(level).filter((mode) => !mode.locked);
  const activePool = unlocked.length > 1
    ? unlocked.filter((mode) => mode.id !== 'classic')
    : unlocked;
  const pool = activePool.length ? activePool : unlocked;
  const topicIndex = Math.max(0, TOPIC_ORDER.indexOf(topicId));
  return pool[(Math.max(1, level) + topicIndex) % pool.length]?.id ?? 'picture';
}
