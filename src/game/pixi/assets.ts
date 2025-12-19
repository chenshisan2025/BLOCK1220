export const TILE_LABELS = ["₿","Ξ","B","◎","✈","✦"];

export function getTileLabel(colorIndex: number) {
  return TILE_LABELS[colorIndex % TILE_LABELS.length];
}
