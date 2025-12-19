import { Board, Match, MatchKind, Pos } from "./types";

function collectLine(board: Board, y: number, x: number, dx: number, dy: number) {
  const color = board[y][x]?.color;
  if (color === undefined) return [] as Pos[];
  const out: Pos[] = [{ x, y }];
  let cx = x + dx;
  let cy = y + dy;
  while (cy >= 0 && cy < board.length && cx >= 0 && cx < board[0].length) {
    if (board[cy][cx]?.color === color) {
      out.push({ x: cx, y: cy });
      cx += dx;
      cy += dy;
    } else break;
  }
  return out;
}

export function findMatches(board: Board): Match[] {
  const w = board[0].length;
  const h = board.length;
  const usedH: boolean[][] = Array.from({ length: h }, () => Array(w).fill(false));
  const usedV: boolean[][] = Array.from({ length: h }, () => Array(w).fill(false));
  const matches: Match[] = [];

  for (let y = 0; y < h; y++) {
    let x = 0;
    while (x < w) {
      const line = collectLine(board, y, x, 1, 0);
      if (line.length >= 3) {
        const kind: MatchKind =
          line.length >= 5 ? "straight5" : line.length === 4 ? "line4" : "normal";
        matches.push({ cells: line, kind, orientation: "horizontal" });
        for (const p of line) usedH[p.y][p.x] = true;
        x += line.length;
      } else x++;
    }
  }

  for (let x = 0; x < w; x++) {
    let y = 0;
    while (y < h) {
      const line = collectLine(board, y, x, 0, 1);
      if (line.length >= 3) {
        const kind: MatchKind =
          line.length >= 5 ? "straight5" : line.length === 4 ? "line4" : "normal";
        matches.push({ cells: line, kind, orientation: "vertical" });
        for (const p of line) usedV[p.y][p.x] = true;
        y += line.length;
      } else y++;
    }
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (usedH[y][x] && usedV[y][x]) {
        const hMatch = matches.find(
          (m) => m.orientation === "horizontal" && m.cells.some((p) => p.x === x && p.y === y)
        );
        const vMatch = matches.find(
          (m) => m.orientation === "vertical" && m.cells.some((p) => p.x === x && p.y === y)
        );
        if (hMatch && vMatch) {
          const unionCells: Pos[] = [
            ...hMatch.cells,
            ...vMatch.cells.filter((p) => !hMatch.cells.some((q) => q.x === p.x && q.y === p.y)),
          ];
          if (unionCells.length >= 5) {
            matches.push({ cells: unionCells, kind: "tOrL5" });
          }
        }
      }
    }
  }
  return matches;
}
