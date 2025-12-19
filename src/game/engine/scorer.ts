import { Match } from "./types";
import { BASE_SCORE_PER_CELL, COMBO_MULTIPLIER_STEP, SPECIAL_BONUS } from "./constants";

export function scoreMatches(matches: Match[], combo: number, width?: number, blackholeCells?: Set<number>): number {
  let cells = 0;
  for (const m of matches) {
    for (const c of m.cells) {
      if (width && blackholeCells) {
        const idx = c.y * width + c.x;
        if (blackholeCells.has(idx)) continue;
      }
      cells++;
    }
  }
  const base = cells * BASE_SCORE_PER_CELL;
  const comboMul = 1 + combo * COMBO_MULTIPLIER_STEP;
  let bonus = 0;
  for (const m of matches) {
    if (m.kind === "line4") bonus += SPECIAL_BONUS.line4;
    else if (m.kind === "tOrL5") bonus += SPECIAL_BONUS.tOrL5;
    else if (m.kind === "straight5") bonus += SPECIAL_BONUS.straight5;
  }
  return Math.floor(base * comboMul + bonus);
}
