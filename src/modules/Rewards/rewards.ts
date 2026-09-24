/** Light rewards helper — XP / coins / badges for Flash Arena */

export const ROUND_SIZE = 10;
export const MAP_PASS_SCORE = 7; // ≥7/10 advances map stage
export const BADGE_SCORE = 8; // ≥8/10 → mode badge

export interface RoundRewards {
  xp: number;
  coins: number;
  stars: number; // 0–3
  badgeId: string | null;
  mapAdvance: boolean;
}

export interface RoundRewardOpts {
  /** Override default tierfreund when score earns a badge */
  badgeId?: string;
}

export function calcRoundRewards(
  correct: number,
  total = ROUND_SIZE,
  opts?: RoundRewardOpts,
): RoundRewards {
  const ratio = total > 0 ? correct / total : 0;
  const stars = ratio >= 0.9 ? 3 : ratio >= 0.7 ? 2 : ratio >= 0.4 ? 1 : 0;
  const xp = 10 + correct * 5 + (stars >= 2 ? 15 : 0);
  const coins = 5 + correct * 2 + (stars === 3 ? 10 : 0);
  const badgeId =
    correct >= BADGE_SCORE ? (opts?.badgeId ?? 'tierfreund') : null;
  const mapAdvance = correct >= MAP_PASS_SCORE;
  return { xp, coins, stars, badgeId, mapAdvance };
}

/** Master Challenge — 12 mixed questions, 1.5× rewards */
export const MASTER_ROUND_SIZE = 12;
export const MASTER_REWARD_MULT = 1.5;
export const MASTER_MAP_PASS_RATIO = 0.7;
export const MASTER_BADGE_RATIO = 0.8;

export function calcMasterRewards(correct: number): RoundRewards {
  const total = MASTER_ROUND_SIZE;
  const base = calcRoundRewards(correct, total);
  const ratio = total > 0 ? correct / total : 0;
  return {
    xp: Math.round(base.xp * MASTER_REWARD_MULT),
    coins: Math.round(base.coins * MASTER_REWARD_MULT),
    stars: base.stars,
    badgeId: ratio >= MASTER_BADGE_RATIO ? 'meister' : null,
    mapAdvance: ratio >= MASTER_MAP_PASS_RATIO,
  };
}
