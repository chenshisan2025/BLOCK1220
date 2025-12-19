import { GameConfig, GameState, Pos, Cell, CellType, BoardFlags } from "./types";
import { createBoard } from "./board";
import { findMatches } from "./matcher";
import { applyGravity } from "./gravity";
import { scoreMatches } from "./scorer";
import { INITIAL_TIME_MS } from "./constants";
import { deriveSpecials, applySpecials } from "./specials";
import { tick as tickTimer } from "./timer";
import type { Board } from "./types";

export function initGame(config: GameConfig): GameState {
  return {
    board: createBoard(config),
    score: 0,
    timeLeft: INITIAL_TIME_MS,
    combo: 0,
    config,
    flags: { blackholeCells: new Set<number>() },
  };
}

export function isValidSwap(state: GameState, idxA: number, idxB: number): boolean {
  const w = state.config.width;
  const h = state.config.height;
  const ax = idxA % w;
  const ay = Math.floor(idxA / w);
  const bx = idxB % w;
  const by = Math.floor(idxB / w);
  const adj = Math.abs(ax - bx) + Math.abs(ay - by) === 1;
  if (!adj) return false;
  const b = state.board.map((row) => row.slice());
  const tmp = b[ay][ax];
  b[ay][ax] = b[by][bx];
  b[by][bx] = tmp;
  const matches = findMatches(b);
  return matches.length > 0;
}

function idPositions(board: Board): Map<string, { x: number; y: number }> {
  const map = new Map<string, { x: number; y: number }>();
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[0].length; x++) {
      const c = board[y][x];
      if (c) map.set(c.id, { x, y });
    }
  }
  return map;
}

export function stepOnceWithDiff(state: GameState): {
  nextBoard: Board;
  cleared: { id: string; x: number; y: number }[];
  moves: { id: string; fromX: number; fromY: number; toX: number; toY: number }[];
} {
  const matches = findMatches(state.board);
  if (matches.length === 0) {
    return { nextBoard: state.board, cleared: [], moves: [] };
  }
  const creations = deriveSpecials(matches);
  const withSpecials = applySpecials(state.board, creations);
  const cleared: { id: string; x: number; y: number }[] = [];
  for (const m of matches) {
    for (const p of m.cells) {
      const c = withSpecials[p.y][p.x];
      if (c) cleared.push({ id: c.id, x: p.x, y: p.y });
    }
  }
  const before = idPositions(withSpecials);
  const after = applyGravity(withSpecials, matches, state.config.colors).board;
  const afterPos = idPositions(after);
  const moves: { id: string; fromX: number; fromY: number; toX: number; toY: number }[] = [];
  for (const [id, from] of before.entries()) {
    const to = afterPos.get(id);
    if (to && (to.x !== from.x || to.y !== from.y)) {
      moves.push({ id, fromX: from.x, fromY: from.y, toX: to.x, toY: to.y });
    }
  }
  return { nextBoard: after, cleared, moves };
}
function swapCells(board: Cell[][], a: Pos, b: Pos): Cell[][] {
  const b2 = board.map((row) => row.slice());
  const tmp = b2[a.y][a.x];
  b2[a.y][a.x] = b2[b.y][b.x];
  b2[b.y][b.x] = tmp;
  return b2;
}

export function swap(state: GameState, a: Pos, b: Pos): GameState {
  const nb = swapCells(state.board, a, b);
  const m = findMatches(nb);
  if (m.length === 0) {
    return { ...state };
  }
  return { ...state, board: nb };
}

export function tick(state: GameState, deltaMs: number): GameState {
  return { ...state, timeLeft: tickTimer(state.timeLeft, deltaMs) };
}

export function step(state: GameState): GameState {
  let current = { ...state };
  let totalScored = 0;
  let cascades = 0;
  while (true) {
    const matches = findMatches(current.board);
    if (matches.length === 0) {
      current = { ...current, combo: cascades > 0 ? current.combo : 0 };
      break;
    }
    const creations = deriveSpecials(matches);
    let boardWithSpecials = applySpecials(current.board, creations);
    const scored = scoreMatches(matches, current.combo, current.config.width, current.flags?.blackholeCells ?? new Set<number>());
    totalScored += scored;
    const nextBoard = applyGravity(boardWithSpecials, matches, current.config.colors).board;
    current = { ...current, board: nextBoard, combo: current.combo + 1, flags: current.flags };
    cascades++;
    if (cascades > 10) break;
  }
  return { ...current, score: state.score + totalScored };
}

export function setBoardFlags(state: GameState, flags: Partial<BoardFlags>): GameState {
  return {
    ...state,
    flags: {
      ...state.flags,
      ...flags,
      blackholeCells: flags.blackholeCells ?? state.flags.blackholeCells,
    },
  };
}
