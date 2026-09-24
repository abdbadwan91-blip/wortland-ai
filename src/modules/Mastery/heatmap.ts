/** Daily practice heatmap persisted in localStorage. */

export const HEATMAP_STORAGE_KEY = 'wortland.heatmap.v1';

export type HeatmapStore = Record<string, number>;

export interface HeatmapCell {
  /** Local calendar date YYYY-MM-DD */
  date: string;
  /** Rounds practiced that day */
  count: number;
  /** 0 empty → 4 hottest */
  level: 0 | 1 | 2 | 3 | 4;
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** Local calendar day as YYYY-MM-DD */
export function toDateKey(d = new Date()): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

export function intensityLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
}

export function loadHeatmap(): HeatmapStore {
  try {
    const raw = localStorage.getItem(HEATMAP_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as HeatmapStore;
    if (!parsed || typeof parsed !== 'object') return {};
    const out: HeatmapStore = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(k) && typeof v === 'number' && v > 0) {
        out[k] = Math.floor(v);
      }
    }
    return out;
  } catch {
    return {};
  }
}

export function saveHeatmap(store: HeatmapStore): void {
  localStorage.setItem(HEATMAP_STORAGE_KEY, JSON.stringify(store));
}

export function clearHeatmap(): void {
  localStorage.removeItem(HEATMAP_STORAGE_KEY);
}

/**
 * Increment today's practice count by 1 (one finished round).
 * Safe to call once per results mount; each call bumps the day total.
 */
export function recordPracticeDay(now = new Date()): number {
  const key = toDateKey(now);
  const store = loadHeatmap();
  const next = (store[key] ?? 0) + 1;
  store[key] = next;
  saveHeatmap(store);
  return next;
}

/** Last `days` calendar days ending today (inclusive), oldest → newest. */
export function getHeatmapCells(days = 35, now = new Date()): HeatmapCell[] {
  const store = loadHeatmap();
  const today = startOfLocalDay(now);
  const cells: HeatmapCell[] = [];
  const start = addDays(today, -(Math.max(1, days) - 1));
  for (let i = 0; i < days; i += 1) {
    const d = addDays(start, i);
    const date = toDateKey(d);
    const count = store[date] ?? 0;
    cells.push({ date, count, level: intensityLevel(count) });
  }
  return cells;
}
