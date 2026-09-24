/** Quest map world progress (Mountain 1–10, Forest 1–10 = stages 1–20). */

export const MAP_STORAGE_KEY = 'wortland-map-progress-v1';
export const TOTAL_STAGES = 20;
export const MOUNTAIN_STAGES = 10;
export const FOREST_STAGES = 10;

export type StageState = 'completed' | 'current' | 'locked';

export interface MapProgress {
  /** Highest unlocked stage (1–20). Stage 1 always starts unlocked. */
  unlockedStage: number;
  /** Stages marked completed (subset of 1..unlockedStage-1 typically). */
  completed: number[];
  /** Whether the falcon flight overlay has been shown for Forest unlock. */
  falconSeen: boolean;
}

export function defaultMapProgress(): MapProgress {
  return { unlockedStage: 1, completed: [], falconSeen: false };
}

export function loadMapProgress(): MapProgress {
  try {
    const raw = localStorage.getItem(MAP_STORAGE_KEY);
    if (!raw) return defaultMapProgress();
    const parsed = { ...defaultMapProgress(), ...JSON.parse(raw) } as MapProgress;
    parsed.unlockedStage = Math.min(
      TOTAL_STAGES,
      Math.max(1, Number(parsed.unlockedStage) || 1),
    );
    parsed.completed = Array.isArray(parsed.completed)
      ? parsed.completed.filter((n) => n >= 1 && n <= TOTAL_STAGES)
      : [];
    return parsed;
  } catch {
    return defaultMapProgress();
  }
}

export function saveMapProgress(p: MapProgress): void {
  localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify(p));
}

export function clearMapProgress(): void {
  localStorage.removeItem(MAP_STORAGE_KEY);
}

export function getStageState(stage: number, progress: MapProgress): StageState {
  if (progress.completed.includes(stage) || stage < progress.unlockedStage) {
    return 'completed';
  }
  if (stage === progress.unlockedStage) return 'current';
  return 'locked';
}

/** Zone-local label index: Mountain 1–10 or Forest 1–10 */
export function zoneLabel(stage: number): { zone: 'mountain' | 'forest'; n: number } {
  if (stage <= MOUNTAIN_STAGES) return { zone: 'mountain', n: stage };
  return { zone: 'forest', n: stage - MOUNTAIN_STAGES };
}

/**
 * Mark current stage complete and unlock the next.
 * Returns whether falcon transition should play (just unlocked Forest).
 */
export function completeCurrentStage(progress: MapProgress, expectedStage?: number): {
  next: MapProgress;
  showFalcon: boolean;
} {
  const current = progress.unlockedStage;
  if (expectedStage !== undefined && expectedStage !== current) {
    return { next: progress, showFalcon: false };
  }
  const completed = progress.completed.includes(current)
    ? progress.completed
    : [...progress.completed, current];
  const unlockedStage = Math.min(TOTAL_STAGES, current + 1);
  const unlockingForest =
    current === MOUNTAIN_STAGES && unlockedStage === MOUNTAIN_STAGES + 1;
  const showFalcon = unlockingForest && !progress.falconSeen;
  const next: MapProgress = {
    unlockedStage,
    completed,
    falconSeen: showFalcon ? true : progress.falconSeen,
  };
  saveMapProgress(next);
  return { next, showFalcon };
}

export function markFalconSeen(progress: MapProgress): MapProgress {
  const next = { ...progress, falconSeen: true };
  saveMapProgress(next);
  return next;
}
