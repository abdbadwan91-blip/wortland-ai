/** Absolute % positions for scenic spiral layouts (x%, y% within each zone). */

export interface NodePos {
  x: number;
  y: number;
}

/**
 * Mountain: stage 1 at base → stage 10 at summit.
 * Tuned to the painted trail (right-biased crop of mountain-bg.png).
 */
export const MOUNTAIN_NODES: NodePos[] = [
  { x: 18, y: 92 }, // 1 path entrance
  { x: 34, y: 84 }, // 2
  { x: 50, y: 76 }, // 3 first rise
  { x: 62, y: 68 }, // 4 bridge / arch
  { x: 48, y: 58 }, // 5 hairpin
  { x: 36, y: 48 }, // 6 left zig
  { x: 52, y: 40 }, // 7
  { x: 68, y: 30 }, // 8 right zig
  { x: 60, y: 20 }, // 9 final ascent
  { x: 74, y: 11 }, // 10 summit tower
];

/**
 * Forest: Forest 1–10 continuing downward through woods.
 * Tuned to painted path / bridge (left-biased crop of forest-bg.png).
 */
export const FOREST_NODES: NodePos[] = [
  { x: 44, y: 14 }, // F1 arrival / canopy clearing
  { x: 58, y: 22 },
  { x: 72, y: 32 }, // toward bridge / light
  { x: 56, y: 42 },
  { x: 38, y: 50 },
  { x: 52, y: 58 }, // mid path
  { x: 66, y: 66 },
  { x: 48, y: 74 },
  { x: 36, y: 82 },
  { x: 52, y: 90 }, // F10 deep forest path
];
