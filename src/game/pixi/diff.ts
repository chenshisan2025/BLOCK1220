export type Pos = { x: number; y: number };
export type PosMap = Map<string, Pos>;

type EngineCell = { id: string };
type EngineBoard = EngineCell[][];

export function mapCellIdToGridXY(board: EngineBoard): PosMap {
  const m: PosMap = new Map();
  for (let y = 0; y < board.length; y++) {
    const row = board[y];
    for (let x = 0; x < row.length; x++) {
      m.set(row[x].id, { x, y });
    }
  }
  return m;
}

export function gridToPixel(pos: Pos, cellSize: number, gap: number) {
  const step = cellSize + gap;
  return { px: pos.x * step, py: pos.y * step };
}

function setDiff(a: Iterable<string>, b: Iterable<string>) {
  const bs = new Set(b);
  const out: string[] = [];
  for (const x of a) if (!bs.has(x)) out.push(x);
  return out;
}

export function computeClearIds(prevPos: PosMap, nextPos: PosMap): string[] {
  return setDiff(prevPos.keys(), nextPos.keys());
}

export function computeMovedIds(prevPos: PosMap, nextPos: PosMap): string[] {
  const moved: string[] = [];
  for (const [id, to] of nextPos.entries()) {
    const from = prevPos.get(id);
    if (!from) continue;
    if (from.x !== to.x || from.y !== to.y) moved.push(id);
  }
  return moved;
}
