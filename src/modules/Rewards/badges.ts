/** Achievements catalog + localStorage persistence (wortland.badges.v1). */

export const BADGES_STORAGE_KEY = 'wortland.badges.v1';

export type BadgeId =
  | 'first-session'
  | 'streak-3'
  | 'tierfreund'
  | 'meister'
  | 'ohrenjaeger'
  | 'rennwolf'
  | 'wortzauberer'
  | 'gespraechsstern'
  | 'memory-champ'
  | 'satzbauer'
  | 'topic-complete';

export interface BadgeDef {
  id: BadgeId;
  emoji: string;
  /** i18n key under badge.* */
  nameKey: string;
}

export interface EarnedBadge {
  id: BadgeId;
  earnedAt: string;
}

export interface BadgesState {
  earned: EarnedBadge[];
}

export const BADGE_CATALOG: BadgeDef[] = [
  { id: 'first-session', emoji: '🌱', nameKey: 'badge.firstSession' },
  { id: 'streak-3', emoji: '🔥', nameKey: 'badge.streak3' },
  { id: 'tierfreund', emoji: '🐾', nameKey: 'badge.tierfreund' },
  { id: 'meister', emoji: '🏆', nameKey: 'badge.meister' },
  { id: 'ohrenjaeger', emoji: '🎧', nameKey: 'badge.ohrenjaeger' },
  { id: 'rennwolf', emoji: '⚡', nameKey: 'badge.rennwolf' },
  { id: 'wortzauberer', emoji: '🔠', nameKey: 'badge.wortzauberer' },
  { id: 'gespraechsstern', emoji: '💬', nameKey: 'badge.gespraechsstern' },
  { id: 'memory-champ', emoji: '🧠', nameKey: 'badge.memoryChamp' },
  { id: 'satzbauer', emoji: '🧩', nameKey: 'badge.satzbauer' },
  { id: 'topic-complete', emoji: '📚', nameKey: 'badge.topicComplete' },
];

export type TitleId = 'anfaenger' | 'lernfreund' | 'meister';

export interface TitleDef {
  id: TitleId;
  /** Min earned badges to unlock this title */
  minBadges: number;
  nameKey: string;
}

/** Titles strip — derived from badge count */
export const TITLE_LADDER: TitleDef[] = [
  { id: 'anfaenger', minBadges: 0, nameKey: 'title.anfaenger' },
  { id: 'lernfreund', minBadges: 2, nameKey: 'title.lernfreund' },
  { id: 'meister', minBadges: 5, nameKey: 'title.meister' },
];

function emptyState(): BadgesState {
  return { earned: [] };
}

export function loadBadges(): BadgesState {
  try {
    const raw = localStorage.getItem(BADGES_STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as BadgesState;
    if (!parsed || !Array.isArray(parsed.earned)) return emptyState();
    return {
      earned: parsed.earned.filter(
        (e): e is EarnedBadge =>
          !!e &&
          typeof e.id === 'string' &&
          typeof e.earnedAt === 'string' &&
          BADGE_CATALOG.some((b) => b.id === e.id),
      ),
    };
  } catch {
    return emptyState();
  }
}

export function saveBadges(state: BadgesState): void {
  localStorage.setItem(BADGES_STORAGE_KEY, JSON.stringify(state));
}

export function clearBadges(): void {
  localStorage.removeItem(BADGES_STORAGE_KEY);
}

export function hasBadge(id: BadgeId, state = loadBadges()): boolean {
  return state.earned.some((e) => e.id === id);
}

export function getBadgeDef(id: string): BadgeDef | undefined {
  return BADGE_CATALOG.find((b) => b.id === id);
}

/**
 * Persist a newly earned badge. Idempotent — returns true only on first award.
 */
export function awardBadge(id: string | null | undefined): boolean {
  if (!id) return false;
  const def = getBadgeDef(id);
  if (!def) return false;
  const state = loadBadges();
  if (state.earned.some((e) => e.id === def.id)) return false;
  state.earned.push({ id: def.id, earnedAt: new Date().toISOString() });
  saveBadges(state);
  try {
    window.dispatchEvent(
      new CustomEvent('wortland:badge', { detail: { id: def.id } }),
    );
  } catch {
    /* ignore */
  }
  return true;
}

/**
 * Award first-session + optional mode badge + streak-3 when streak ≥ 3.
 * Call from results flows after computing the post-round streak.
 */
export function applySessionBadges(opts: {
  badgeId?: string | null;
  streak?: number;
}): void {
  awardBadge('first-session');
  if (opts.badgeId) awardBadge(opts.badgeId);
  if ((opts.streak ?? 0) >= 3) awardBadge('streak-3');
}

export function getEarnedCount(state = loadBadges()): number {
  return state.earned.length;
}

export function getCurrentTitle(state = loadBadges()): TitleDef {
  const n = state.earned.length;
  let current = TITLE_LADDER[0]!;
  for (const title of TITLE_LADDER) {
    if (n >= title.minBadges) current = title;
  }
  return current;
}

export interface BadgeView {
  def: BadgeDef;
  unlocked: boolean;
  earnedAt: string | null;
}

/** Catalog with locked/unlocked status for Profile grid. */
export function listBadgeViews(state = loadBadges()): BadgeView[] {
  const byId = new Map(state.earned.map((e) => [e.id, e]));
  return BADGE_CATALOG.map((def) => {
    const earned = byId.get(def.id);
    return {
      def,
      unlocked: !!earned,
      earnedAt: earned?.earnedAt ?? null,
    };
  });
}

/** Recent earned badges for Home teaser (newest first). */
export function listRecentEarned(limit = 4, state = loadBadges()): BadgeDef[] {
  const sorted = [...state.earned].sort(
    (a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime(),
  );
  const out: BadgeDef[] = [];
  for (const e of sorted) {
    const def = getBadgeDef(e.id);
    if (def) out.push(def);
    if (out.length >= limit) break;
  }
  return out;
}
