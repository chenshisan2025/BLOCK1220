import { Board, Match, SpecialType, CellType } from "./types";

export interface SpecialCreation {
  x: number;
  y: number;
  type: SpecialType;
}

export function deriveSpecials(matches: Match[]): SpecialCreation[] {
  const out: SpecialCreation[] = [];
  for (const m of matches) {
    if (m.kind === "line4") {
      const c = m.cells[Math.floor(m.cells.length / 2)];
      out.push({ x: c.x, y: c.y, type: SpecialType.Line });
    } else if (m.kind === "straight5") {
      const c = m.cells[Math.floor(m.cells.length / 2)];
      out.push({ x: c.x, y: c.y, type: SpecialType.Color });
    } else if (m.kind === "tOrL5") {
      const center = m.cells.find((p) =>
        m.cells.filter((q) => q.x === p.x || q.y === p.y).length >= 4
      ) ?? m.cells[0];
      out.push({ x: center.x, y: center.y, type: SpecialType.Bomb });
    }
  }
  return out;
}

export function applySpecials(board: Board, creations: SpecialCreation[]): Board {
  const b = board.map((row) => row.slice());
  for (const s of creations) {
    const cell = b[s.y][s.x];
    b[s.y][s.x] = {
      id: cell.id,
      type: CellType.Special,
      color: cell.color,
      special: s.type,
    };
  }
  return b;
}
