"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import { createPixiApp, destroyPixiApp } from "./PixiApp";
import { BoardRenderer } from "./BoardRenderer";
import { InputController } from "./InputController";
import { initGame, tick as engineTick, swap as engineSwap, step as engineStep, setBoardFlags } from "../../game/engine/engine";
import type { GameConfig, GameState } from "../../game/engine/types";
import { SoundManager } from "../../lib/audio/SoundManager";
import { animateSwap, animateSwapBack, animateClear, animateDrop, animateSpecialLine, animateSpecialBomb, animateSpecialColor } from "./Animations";
import { isValidSwap } from "../../game/engine/engine";
import { mapCellIdToGridXY, computeClearIds, computeMovedIds, gridToPixel } from "./diff";
import { SpecialType } from "../../game/engine/types";
import GameHUD from "../ui/GameHUD";
import type { BossCtx } from "../story/boss/bossTypes";
import { useSearchParams } from "next/navigation";

type SpecialTrigger =
  | { kind: "Line"; lineIndex: number; orientation: "row" | "col" }
  | { kind: "Bomb"; cx: number; cy: number; radius: number }
  | { kind: "Color" };

function detectSpecialTriggersFromClears(opts: {
  prevState: any;
  clearIds: string[];
  cellSize: number;
  gap: number;
}): SpecialTrigger[] {
  const { prevState, clearIds, cellSize, gap } = opts;
  const board = prevState?.board;
  if (!board) return [];
  const triggers: SpecialTrigger[] = [];
  const step = cellSize + gap;
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      const cell = board[y][x];
      if (!cell) continue;
      if (!clearIds.includes(cell.id)) continue;
      const sp = cell.special;
      if (!sp) continue;
      if (sp === SpecialType.Line || sp?.type === "Line") {
        triggers.push({ kind: "Line", lineIndex: sp?.orientation === "col" ? x : y, orientation: sp?.orientation === "col" ? "col" : "row" });
      } else if (sp === SpecialType.Bomb || sp?.type === "Bomb") {
        const cx = x * step + cellSize / 2;
        const cy = y * step + cellSize / 2;
        triggers.push({ kind: "Bomb", cx, cy, radius: cellSize * 1.2 });
      } else if (sp === SpecialType.Color || sp?.type === "Color") {
        triggers.push({ kind: "Color" });
      }
    }
  }
  // dedupe: one Color per round; unique lines; limit bombs
  const dedup: SpecialTrigger[] = [];
  let hasColor = false;
  const lineSeen = new Set<string>();
  let bombCount = 0;
  for (const t of triggers) {
    if (t.kind === "Color") {
      if (!hasColor) {
        dedup.push(t);
        hasColor = true;
      }
      continue;
    }
    if (t.kind === "Line") {
      const key = `${t.orientation}:${t.lineIndex}`;
      if (!lineSeen.has(key)) {
        lineSeen.add(key);
        dedup.push(t);
      }
      continue;
    }
    if (t.kind === "Bomb") {
      if (bombCount < 2) {
        dedup.push(t);
        bombCount++;
      }
      continue;
    }
  }
  return dedup;
}

export default function PixiGame({
  mode,
  isPaused = false,
  reviveToken = 0,
  reviveAddMs = 0,
  onState,
  bossController,
  telegraph,
  bossCtx,
  sponsor,
  onEventSignals,
}: {
  mode: "story" | "endless";
  isPaused?: boolean;
  reviveToken?: number;
  reviveAddMs?: number;
  onState?: (s: any | null) => void;
  bossController?: {
    onSwapAttempt: (aIdx: number, bIdx: number, ctx: BossCtx) => { allow: boolean; reason?: string };
    getCellFlags: (index: number) => { frozen?: boolean; blackhole?: boolean };
    getTelegraph: () => { kind: string; secondsLeft: number } | null;
  };
  telegraph?: { kind: string; secondsLeft: number; messageKey: string; severity: string } | null;
  bossCtx?: BossCtx | null;
  sponsor?: { name: string; logo?: string; progress?: { current: number; required: number } } | null;
  onEventSignals?: (signals: any) => void;
}) {
  const sp = useSearchParams();
  const hostRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const boardRef = useRef<BoardRenderer | null>(null);
  const inputRef = useRef<InputController | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const stateRef = useRef<GameState | null>(null);
  const animatingRef = useRef<boolean>(false);

  const config: GameConfig = useMemo(() => ({ width: 6, height: 6, colors: 6, seed: 12345 }), []);

  useEffect(() => {
    setState(initGame(config));
  }, [config]);

  useEffect(() => {
    if (!hostRef.current) return;
    const host = hostRef.current;
    const app = createPixiApp(host);
    appRef.current = app;
    const board = new BoardRenderer(config.width, config.height, 64, 8);
    boardRef.current = board;
    app.stage.addChild(board.root);
    const input = new InputController(board);
    inputRef.current = input;
    input.attach(app.stage, async (intent) => {
      if (!intent) return;
      if (animatingRef.current) return;
      if (!boardRef.current || !appRef.current) return;
      const prev = stateRef.current;
      if (!prev) return;
      const aId = board.getCellIdAt(prev as any, intent.a.x, intent.a.y);
      const bId = board.getCellIdAt(prev as any, intent.b.x, intent.b.y);
      if (!aId || !bId) return;
      const aSp = board.getSpriteById(aId);
      const bSp = board.getSpriteById(bId);
      if (!aSp || !bSp) return;
      animatingRef.current = true;
      try {
        const idxA = intent.a.y * config.width + intent.a.x;
        const idxB = intent.b.y * config.width + intent.b.x;
        if (bossController && bossCtx) {
          bossCtx.swapCount += 1;
          const gate = bossController.onSwapAttempt(idxA, idxB, bossCtx);
          if (!gate.allow) {
            onEventSignals?.({ swap: { total: 1, valid: 0 } });
            SoundManager.get().playSfx("SFX_INVALID_SWAP");
            const tg = bossController.getTelegraph?.();
            if (tg?.kind === "REVERT") {
              await animateSwapBack(appRef.current, aSp as any, bSp as any);
            } else {
              await animateSwapBack(appRef.current, aSp as any, bSp as any);
            }
            board.render(prev as any, null);
            animatingRef.current = false;
            return;
          }
        }
        const willMatch = isValidSwap(prev, idxA, idxB);
        if (willMatch) {
          onEventSignals?.({ swap: { total: 1, valid: 1 } });
          SoundManager.get().playSfx("SFX_SWAP");
          await animateSwap(app, aSp as any, bSp as any);
          const swapped = engineSwap(prev, intent.a, intent.b);
          let cur = swapped;
          let safety = 0;
          while (safety++ < 10) {
            const prevGrid = new Map(board.getLastGridPositions());
            if (bossController) {
              const w = config.width;
              const h = config.height;
              const blackholeCells = new Set<number>();
              for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                  const idx = y * w + x;
                  const f = bossController.getCellFlags(idx);
                  if (f?.blackhole) blackholeCells.add(idx);
                }
              }
              cur = setBoardFlags(cur, { blackholeCells });
            }
            const nextState = engineStep(cur);
            const nextGrid = mapCellIdToGridXY(nextState.board as any);
            const clearIds = computeClearIds(prevGrid, nextGrid);
            const movedIds = computeMovedIds(prevGrid, nextGrid);
            if (clearIds.length === 0 && movedIds.length === 0) {
              cur = nextState;
              break;
            }
            onEventSignals?.({ cascade: 1 });
            board.render(nextState as any, null);
            if (bossController) {
              const w = config.width;
              const h = config.height;
              for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                  const id = board.getCellIdAt(nextState as any, x, y);
                  if (!id) continue;
                  const sp = board.getSpriteById(id) as any;
                  if (!sp) continue;
                  const flags = bossController.getCellFlags(y * w + x);
                  if (flags) {
                    sp.setFrozen?.(Boolean(flags.frozen));
                    sp.setBlackhole?.(Boolean(flags.blackhole));
                  }
                }
              }
            }
            const triggers = detectSpecialTriggersFromClears({
              prevState: cur,
              clearIds,
              cellSize: board.getCellSize(),
              gap: board.getGap(),
            });
            for (const trig of triggers) {
              if (!appRef.current) break;
              if (trig.kind === "Color") {
                await animateSpecialColor(appRef.current, board.root);
                onEventSignals?.({ specialConsumed: { Color: 1 }, specials: { total: 1, Color: 1 } });
              } else if (trig.kind === "Line") {
                const ori = trig.orientation === "row" ? "horizontal" : "vertical";
                await animateSpecialLine(appRef.current, board.root, trig.lineIndex, ori);
                onEventSignals?.({ specialConsumed: { Line: 1 }, specials: { total: 1, Line: 1 } });
              } else {
                await animateSpecialBomb(appRef.current, trig.cx, trig.cy, trig.radius);
                onEventSignals?.({ specialConsumed: { Bomb: 1 }, specials: { total: 1, Bomb: 1 } });
              }
            }
            const clearSprites = clearIds
              .map((id) => board.getSpriteById(id))
              .filter(Boolean) as any[];
            const moves = [];
            const cellSize = board.getCellSize();
            for (const id of movedIds) {
              const sp = board.getSpriteById(id) as any;
              if (!sp) continue;
              const toGrid = nextGrid.get(id)!;
              const { px, py } = gridToPixel(toGrid, board.getCellSize(), board.getGap());
              moves.push({ sprite: sp, toX: px, toY: py });
            }
            for (const [id, toGrid] of nextGrid.entries()) {
              if (prevGrid.has(id)) continue;
              const sp = board.getSpriteById(id) as any;
              if (!sp) continue;
              const { px, py } = gridToPixel(toGrid, board.getCellSize(), board.getGap());
              moves.push({ sprite: sp, toX: px, toY: py, fromX: px, fromY: -cellSize });
              sp.x = px;
              sp.y = -cellSize;
            }
            if (clearSprites.length) await animateClear(app, clearSprites as any, 140);
            if (moves.length) await animateDrop(app, moves as any, 180);
            board.render(nextState as any, null);
            cur = nextState;
          }
          stateRef.current = cur;
          setState(cur);
          board.render(cur as any, null);
        } else {
          SoundManager.get().playSfx("SFX_INVALID_SWAP");
          await animateSwapBack(app, aSp as any, bSp as any);
          board.render(prev as any, null);
        }
      } finally {
        animatingRef.current = false;
      }
    });
    return () => {
      if (appRef.current) destroyPixiApp(appRef.current);
      appRef.current = null;
      boardRef.current = null;
      inputRef.current = null;
    };
  }, [config]);

  useEffect(() => {
    if (isPaused) return;
    const id = window.setInterval(() => {
      setState((prev) => (prev ? engineTick(prev, 1000) : prev));
      if (state && state.timeLeft <= 10_000) {
        SoundManager.get().playSfx("SFX_TIMER_WARNING");
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [state, isPaused]);

  useEffect(() => {
    if (!state || !boardRef.current) return;
    stateRef.current = state;
    boardRef.current.render(state as any, null);
    onState?.(state);
  }, [state]);

  useEffect(() => {
    if (!state) return;
    if (reviveToken > 0 && reviveAddMs > 0) {
      setState((prev) => (prev ? { ...prev, timeLeft: (prev.timeLeft ?? 0) + reviveAddMs } : prev));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviveToken]);

  return (
    <div className="relative">
      <GameHUD mode={mode} state={state} onExit={() => (window.location.href = "/zh/play")} telegraph={telegraph ?? undefined} sponsor={sponsor ?? undefined} />
      <div ref={hostRef} className="w-full h-[80vh]" />
    </div>
  );
}
