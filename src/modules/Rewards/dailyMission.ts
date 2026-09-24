/** Daily Mission goals + claimable coin rewards (localStorage). */

import { toDateKey } from '../Mastery/heatmap';

export const DAILY_STORAGE_KEY = 'wortland.daily.v1';

export type DailyGoalId = 'rounds' | 'correct' | 'xp';

export interface DailyGoal {
  id: DailyGoalId;
  target: number;
  progress: number;
  claimed: boolean;
}

export interface DailyMissionState {
  date: string;
  goals: DailyGoal[];
  bonusClaimed: boolean;
}

export interface DailyProgressDelta {
  rounds?: number;
  correct?: number;
  xp?: number;
}

/** Coin reward when claiming a completed goal */
export const GOAL_CLAIM_COINS: Record<DailyGoalId, number> = {
  rounds: 20,
  correct: 25,
  xp: 30,
};

/** Bonus when all three goals are done */
export const BONUS_CLAIM_COINS = 50;

const DEFAULT_TARGETS: Record<DailyGoalId, number> = {
  rounds: 1,
  correct: 8,
  xp: 50,
};

const GOAL_ORDER: DailyGoalId[] = ['rounds', 'correct', 'xp'];

export function createDefaultGoals(): DailyGoal[] {
  return GOAL_ORDER.map((id) => ({
    id,
    target: DEFAULT_TARGETS[id],
    progress: 0,
    claimed: false,
  }));
}

export function createFreshState(now = new Date()): DailyMissionState {
  return {
    date: toDateKey(now),
    goals: createDefaultGoals(),
    bonusClaimed: false,
  };
}

function isValidGoal(g: unknown): g is DailyGoal {
  if (!g || typeof g !== 'object') return false;
  const o = g as Record<string, unknown>;
  return (
    (o.id === 'rounds' || o.id === 'correct' || o.id === 'xp') &&
    typeof o.target === 'number' &&
    typeof o.progress === 'number' &&
    typeof o.claimed === 'boolean'
  );
}

function normalizeState(raw: unknown, today: string): DailyMissionState | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(o.date)) {
    return null;
  }
  if (o.date !== today) return null;
  if (!Array.isArray(o.goals)) return null;

  const byId = new Map(
    (o.goals.filter(isValidGoal) as DailyGoal[]).map((g) => [g.id, g]),
  );

  const goals = createDefaultGoals().map((def) => {
    const existing = byId.get(def.id);
    if (!existing) return def;
    return {
      id: def.id,
      target: existing.target > 0 ? Math.floor(existing.target) : def.target,
      progress: Math.max(0, Math.floor(existing.progress)),
      claimed: Boolean(existing.claimed),
    };
  });

  return {
    date: today,
    goals,
    bonusClaimed: Boolean(o.bonusClaimed),
  };
}

export function loadDailyMission(now = new Date()): DailyMissionState {
  const today = toDateKey(now);
  try {
    const raw = localStorage.getItem(DAILY_STORAGE_KEY);
    if (!raw) return createFreshState(now);
    const parsed = JSON.parse(raw) as unknown;
    const normalized = normalizeState(parsed, today);
    if (!normalized) {
      const fresh = createFreshState(now);
      saveDailyMission(fresh);
      return fresh;
    }
    return normalized;
  } catch {
    return createFreshState(now);
  }
}

export function saveDailyMission(state: DailyMissionState): void {
  localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(state));
}

export function clearDailyMission(): void {
  localStorage.removeItem(DAILY_STORAGE_KEY);
}

function emitDailyChanged(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('wortland:daily'));
  }
}

/**
 * Increment today's mission progress from a finished arena round.
 * Call once per results mount alongside recordPracticeDay.
 */
export function recordDailyProgress(
  delta: DailyProgressDelta,
  now = new Date(),
): DailyMissionState {
  const state = loadDailyMission(now);
  const bump = (id: DailyGoalId, amount: number) => {
    if (!amount || amount <= 0) return;
    const goal = state.goals.find((g) => g.id === id);
    if (!goal) return;
    const softCap = Math.max(goal.target * 5, goal.target);
    goal.progress = Math.min(softCap, goal.progress + Math.floor(amount));
  };
  bump('rounds', delta.rounds ?? 0);
  bump('correct', delta.correct ?? 0);
  bump('xp', delta.xp ?? 0);
  saveDailyMission(state);
  emitDailyChanged();
  return state;
}

export function isGoalComplete(goal: DailyGoal): boolean {
  return goal.progress >= goal.target;
}

export function allGoalsComplete(state: DailyMissionState): boolean {
  return state.goals.every(isGoalComplete);
}

export function allGoalsClaimed(state: DailyMissionState): boolean {
  return state.goals.every((g) => g.claimed);
}

/** Claim a finished goal. Returns coins awarded (0 if not claimable). */
export function claimDailyGoal(
  id: DailyGoalId,
  now = new Date(),
): { coins: number; state: DailyMissionState } {
  const state = loadDailyMission(now);
  const goal = state.goals.find((g) => g.id === id);
  if (!goal || goal.claimed || !isGoalComplete(goal)) {
    return { coins: 0, state };
  }
  goal.claimed = true;
  const coins = GOAL_CLAIM_COINS[id];
  saveDailyMission(state);
  emitDailyChanged();
  return { coins, state };
}

/** Claim the all-goals bonus. Returns coins (0 if not claimable). */
export function claimDailyBonus(
  now = new Date(),
): { coins: number; state: DailyMissionState } {
  const state = loadDailyMission(now);
  if (state.bonusClaimed || !allGoalsComplete(state)) {
    return { coins: 0, state };
  }
  state.bonusClaimed = true;
  saveDailyMission(state);
  emitDailyChanged();
  return { coins: BONUS_CLAIM_COINS, state };
}

/**
 * Claim any remaining unclaimed completed goals + bonus in one tap.
 * Returns total coins awarded.
 */
export function claimAllDailyRewards(
  now = new Date(),
): { coins: number; state: DailyMissionState } {
  let total = 0;
  let state = loadDailyMission(now);
  for (const g of [...state.goals]) {
    if (!g.claimed && isGoalComplete(g)) {
      const r = claimDailyGoal(g.id, now);
      total += r.coins;
      state = r.state;
    }
  }
  if (!state.bonusClaimed && allGoalsComplete(state)) {
    const r = claimDailyBonus(now);
    total += r.coins;
    state = r.state;
  }
  return { coins: total, state };
}

export function goalProgressPct(goal: DailyGoal): number {
  if (goal.target <= 0) return 0;
  return Math.min(100, Math.round((goal.progress / goal.target) * 100));
}

export function goalLabelKey(id: DailyGoalId): string {
  return `daily.goal.${id}`;
}
