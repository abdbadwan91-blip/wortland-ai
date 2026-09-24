import { loadHeatmap, toDateKey, type HeatmapStore } from './heatmap';

export interface StreakDay {
  date: string;
  count: number;
  isToday: boolean;
}

export interface StreakStats {
  current: number;
  best: number;
  week: StreakDay[];
}

function dateFromKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

function dayDistance(a: string, b: string): number {
  return Math.round((dateFromKey(b).getTime() - dateFromKey(a).getTime()) / 86_400_000);
}

function currentStreak(store: HeatmapStore, now: Date): number {
  let streak = 0;
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);

  while (store[toDateKey(cursor)] > 0) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function bestStreak(store: HeatmapStore): number {
  const days = Object.keys(store).sort();
  let best = 0;
  let run = 0;
  let previous: string | undefined;

  for (const date of days) {
    if (store[date] <= 0) continue;
    run = previous && dayDistance(previous, date) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    previous = date;
  }

  return best;
}

/** Derive streaks from the persisted practice heatmap; no second streak store is needed. */
export function getStreakStats(days = 7, now = new Date()): StreakStats {
  const store = loadHeatmap();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  const week: StreakDay[] = [];
  const count = Math.max(1, days);

  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const key = toDateKey(date);
    week.push({ date: key, count: store[key] ?? 0, isToday: offset === 0 });
  }

  return {
    current: currentStreak(store, now),
    best: bestStreak(store),
    week,
  };
}
