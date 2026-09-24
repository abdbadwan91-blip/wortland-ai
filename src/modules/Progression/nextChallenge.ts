import type { Screen } from '../Auth/AppContext';
import { GAME_MODE_DEFS, type GameModeId } from '../Content/cefr';

export const MODE_ORDER: GameModeId[] = [
  'classic',
  'picture',
  'quick',
  'article',
  'memory',
  'build',
  'master',
  'listen',
  'speed',
  'puzzle',
  'conversation',
];

export function screenForMode(mode: GameModeId): Screen {
  const map: Record<GameModeId, Screen> = {
    classic: 'classicCards',
    picture: 'pictureMatch',
    quick: 'quickPick',
    article: 'articlePick',
    memory: 'memoryFlip',
    build: 'buildIt',
    master: 'masterChallenge',
    listen: 'listeningHunt',
    speed: 'speedRound',
    puzzle: 'wordPuzzle',
    conversation: 'conversationMission',
  };
  return map[mode];
}

export type NextChallenge =
  | { kind: 'retry' }
  | { kind: 'launch'; mode: GameModeId; level: number; screen: Screen };

/** Pass → next unlocked mode (or next level). Fail → retry current. */
export function resolveNextChallenge(opts: {
  currentMode: string;
  level: number;
  passed: boolean;
}): NextChallenge {
  if (!opts.passed) return { kind: 'retry' };

  const level = Math.max(1, Math.min(20, opts.level));
  const idx = MODE_ORDER.indexOf(opts.currentMode as GameModeId);

  if (idx >= 0) {
    for (let i = idx + 1; i < MODE_ORDER.length; i++) {
      const mode = MODE_ORDER[i];
      const def = GAME_MODE_DEFS.find((m) => m.id === mode);
      if (def && level >= def.minLevel) {
        return { kind: 'launch', mode, level, screen: screenForMode(mode) };
      }
    }
  }

  if (level < 20) {
    const nextLevel = level + 1;
    const preferred = [...MODE_ORDER].reverse().find((mode) => {
      const def = GAME_MODE_DEFS.find((m) => m.id === mode);
      return !!def && nextLevel >= def.minLevel;
    });
    const mode = (preferred || 'picture') as GameModeId;
    return { kind: 'launch', mode, level: nextLevel, screen: screenForMode(mode) };
  }

  return { kind: 'launch', mode: 'picture', level: 20, screen: 'pictureMatch' };
}
