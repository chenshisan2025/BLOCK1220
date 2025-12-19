import { colors } from "../../design/tokens";

function hexToNumber(hex: string): number {
  const h = hex.startsWith("#") ? hex.slice(1) : hex;
  return parseInt(h, 16);
}

export const PIXI_COLOR_CYAN = hexToNumber(colors.neonCyan);
export const PIXI_COLOR_PURPLE = hexToNumber(colors.neonPurple);
export const PIXI_COLOR_TEXT = hexToNumber(colors.neonText);
export const PIXI_COLOR_YELLOW = hexToNumber(colors.neonYellow);

const PALETTE = [PIXI_COLOR_CYAN, PIXI_COLOR_PURPLE, PIXI_COLOR_CYAN, PIXI_COLOR_PURPLE, PIXI_COLOR_CYAN, PIXI_COLOR_PURPLE];

export function getTileFill(colorIndex: number): number {
  return PALETTE[colorIndex % PALETTE.length];
}

export const BORDER_COLOR = PIXI_COLOR_TEXT;
