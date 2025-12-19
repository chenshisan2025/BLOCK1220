import { Board, Cell, CellType, GameConfig } from "./types";

function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function randomColor(rand: () => number, colors: number, avoid: number[] = []) {
  let c = Math.floor(rand() * colors);
  let tries = 0;
  while (avoid.includes(c) && tries < 10) {
    c = Math.floor(rand() * colors);
    tries++;
  }
  return c;
}

export function createBoard(config: GameConfig): Board {
  const rand = lcg(config.seed ?? Date.now());
  const b: Board = Array.from({ length: config.height }, () => Array<Cell>(config.width));
  for (let y = 0; y < config.height; y++) {
    for (let x = 0; x < config.width; x++) {
      const avoid: number[] = [];
      if (x >= 2) {
        const c1 = b[y][x - 1]?.color;
        const c2 = b[y][x - 2]?.color;
        if (c1 !== undefined && c2 !== undefined && c1 === c2) avoid.push(c1);
      }
      if (y >= 2) {
        const c1 = b[y - 1][x]?.color;
        const c2 = b[y - 2][x]?.color;
        if (c1 !== undefined && c2 !== undefined && c1 === c2) avoid.push(c1);
      }
      const color = randomColor(rand, config.colors, avoid);
      const cell: Cell = {
        id: `${y}-${x}-${Math.floor(rand() * 1e9)}`,
        type: CellType.Normal,
        color,
      };
      b[y][x] = cell;
    }
  }
  return b;
}
