/** Level Wheel difficulty profiles for Flash Arena (L1–20) */

export interface LevelParams {
  optionCount: number; // picture/quick choices
  roundSize: number;
  /** Soft countdown seconds; null = no timer. Timeout = gentle miss, not game over. */
  timerSec: number | null;
  /** Default TTS rate for auto-play */
  audioRate: 'normal' | 'slow';
  /** Weight for pickSessionTargets weak/due preference (0–1) */
  preferWeakBias: number;
}

/**
 * L1–3 starter: 4 options, 10 Q, no timer, slow-friendly audio, light weak bias
 * L4–6 A1:      5 options, 12 Q, no timer, slow-friendly, medium bias
 * L7–9 A2+:     6 options, 12 Q, 12s soft timer, normal audio default, strong bias
 * L10–12 B1:    6 options, 14 Q, 10s soft timer, normal audio, stronger bias
 * L13–16 B2:    6 options, 15 Q, 8s soft timer, normal audio, very strong bias
 * L17–20 C1:    7 options, 16 Q, 7s soft timer, normal audio, highest bias
 */
export function getLevelParams(level: number): LevelParams {
  const n = Number.isFinite(level) ? Math.max(1, Math.floor(level)) : 1;
  if (n <= 3) {
    return {
      optionCount: 4,
      roundSize: 10,
      timerSec: null,
      audioRate: 'slow',
      preferWeakBias: 0.3,
    };
  }
  if (n <= 6) {
    return {
      optionCount: 5,
      roundSize: 12,
      timerSec: null,
      audioRate: 'slow',
      preferWeakBias: 0.5,
    };
  }
  if (n <= 9) {
    return {
      optionCount: 6,
      roundSize: 12,
      timerSec: 12,
      audioRate: 'normal',
      preferWeakBias: 0.7,
    };
  }
  if (n <= 12) {
    return {
      optionCount: 6,
      roundSize: 14,
      timerSec: 10,
      audioRate: 'normal',
      preferWeakBias: 0.75,
    };
  }
  if (n <= 16) {
    return {
      optionCount: 6,
      roundSize: 15,
      timerSec: 8,
      audioRate: 'normal',
      preferWeakBias: 0.85,
    };
  }
  return {
    optionCount: 7,
    roundSize: 16,
    timerSec: 7,
    audioRate: 'normal',
    preferWeakBias: 0.9,
  };
}

/** Memory Flip pair count by level (mode unlocks at L4). L7–9 uses 8; L10+ uses 10. */
export function getMemoryPairCount(level: number): number {
  const n = Number.isFinite(level) ? Math.max(1, Math.floor(level)) : 1;
  if (n >= 10) return 10;
  if (n >= 7) return 8;
  return 6;
}
