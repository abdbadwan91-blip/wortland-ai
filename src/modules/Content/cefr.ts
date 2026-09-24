export type CefrBand = 'starter' | 'a1' | 'a2' | 'b1' | 'b2' | 'c1';

export function levelToCefr(level: number): CefrBand {
  if (level <= 3) return 'starter';
  if (level <= 6) return 'a1';
  if (level <= 9) return 'a2';
  if (level <= 12) return 'b1';
  if (level <= 16) return 'b2';
  return 'c1';
}

export function cefrLabelKey(band: CefrBand): string {
  return `wheel.cefr.${band}`;
}

export function cefrColor(band: CefrBand): string {
  const map: Record<CefrBand, string> = {
    starter: 'var(--cefr-starter)',
    a1: 'var(--cefr-a1)',
    a2: 'var(--cefr-a2)',
    b1: 'var(--cefr-b1)',
    b2: 'var(--cefr-b2)',
    c1: 'var(--cefr-c1)',
  };
  return map[band];
}

export const TOPICS = [
  { id: 'tiere', icon: '🐾', locked: false },
  { id: 'essen', icon: '🍎', locked: false },
  { id: 'zuhause', icon: '🏠', locked: false },
  { id: 'schule', icon: '🏫', locked: false },
  { id: 'familie', icon: '👨‍👩‍👧', locked: false },
  { id: 'farben', icon: '🎨', locked: false },
  { id: 'kleidung', icon: '👕', locked: false },
  { id: 'koerper', icon: '🧍', locked: false },
  { id: 'wetter', icon: '🌤️', locked: false },
  { id: 'transport', icon: '🚌', locked: false },
  { id: 'gesundheit', icon: '💊', locked: false },
  { id: 'arbeit', icon: '💼', locked: false },
  { id: 'natur', icon: '🌿', locked: false },
  { id: 'zahlen', icon: '🔢', locked: false },
] as const;

export type GameModeId =
  | 'classic'
  | 'picture'
  | 'memory'
  | 'quick'
  | 'article'
  | 'build'
  | 'master'
  | 'listen'
  | 'speed'
  | 'puzzle'
  | 'conversation';

export interface GameModeDef {
  id: GameModeId;
  icon: string;
  color: string;
  /** Minimum Level Wheel level required (1 = always) */
  minLevel: number;
}

/** Base mode catalog — lock/unlock via getGameModes(level) */
export const GAME_MODE_DEFS: GameModeDef[] = [
  { id: 'classic', icon: 'ui/modes/classic.png', color: '#3b82f6', minLevel: 1 },
  { id: 'picture', icon: 'ui/modes/picture.png', color: '#22c55e', minLevel: 1 },
  { id: 'quick', icon: 'ui/modes/quick.png', color: '#f97316', minLevel: 2 },
  { id: 'article', icon: 'ui/modes/article.png', color: '#06b6d4', minLevel: 3 },
  { id: 'memory', icon: 'ui/modes/memory.png', color: '#ec4899', minLevel: 4 },
  { id: 'build', icon: 'ui/modes/build.png', color: '#a855f7', minLevel: 5 },
  { id: 'master', icon: 'ui/modes/master.png', color: '#eab308', minLevel: 6 }, // unlock stub: A1 complete
  { id: 'listen', icon: 'ui/modes/listen.png', color: '#14b8a6', minLevel: 7 }, // Hörjagd / Listening Hunt
  { id: 'speed', icon: 'ui/modes/speed.png', color: '#ef4444', minLevel: 8 }, // Schnellrunde / Speed Round / Word Race
  { id: 'puzzle', icon: 'ui/modes/puzzle.png', color: '#f59e0b', minLevel: 9 }, // Wortpuzzle / Word Puzzle / scramble
  { id: 'conversation', icon: 'ui/modes/conversation.png', color: '#f472b6', minLevel: 10 }, // Gesprächsmission / Conversation Mission
];

export function getGameModes(level: number) {
  return GAME_MODE_DEFS.map((m) => ({
    ...m,
    locked: level < m.minLevel,
  }));
}

/** @deprecated use getGameModes — kept for any leftover imports */
export const GAME_MODES = getGameModes(1);
