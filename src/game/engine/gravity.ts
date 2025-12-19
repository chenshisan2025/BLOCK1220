import { Board, Match, Cell, CellType } from "./types";

function makeNewCell(colorCount: number): Cell {
  const color = Math.floor(Math.random() * colorCount);
  return {
    id: `${Date.now()}-${Math.floor(Math.random() * 1e9)}`,
    type: CellType.Normal,
    color,
  };
}

export function clearMatched(board: Board, matches: Match[], keepPositions: { x: number; y: number }[]): Board {
  const b = board.map((row) => row.slice());
  const keepKey = new Set(keepPositions.map((p) => `${p.x},${p.y}`));
  for (const m of matches) {
    for (const p of m.cells) {
      const key = `${p.x},${p.y}`;
      if (!keepKey.has(key)) {
        b[p.y][p.x] = undefined as unknown as Cell;
      }
    }
  }
  return b;
}

export function applyGravity(board: Board, matches: Match[], colors: number): { board: Board } {
  let b = board.map((row) => row.slice());
  const keep: { x: number; y: number }[] = [];
  b = clearMatched(b, matches, keep);
  const w = b[0].length;
  const h = b.length;

  for (let x = 0; x < w; x++) {
    let writeY = h - 1;
    for (let y = h - 1; y >= 0; y--) {
      if (b[y][x]) {
        if (writeY !== y) {
          b[writeY][x] = b[y][x];
          b[y][x] = undefined as unknown as Cell;
        }
        writeY--;
      }
    }
    for (let y = writeY; y >= 0; y--) {
      b[y][x] = makeNewCell(colors);
    }
  }

  return { board: b };
}
