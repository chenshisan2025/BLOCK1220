import type { LevelConfig, LevelGoal } from "./levelTypes";

export function createLevelRuntime(config: LevelConfig) {
  let score = 0;
  let collected: Record<number, number> = {};
  const last: Record<number, number> = {};
  let collectedDelta: Record<number, number> = {};

  function updateFromEngine(state: any) {
    score = Number(state?.score ?? 0);
    if (config.goal.type === "Collect") {
      const target = config.goal.targetType;
      const bh: Set<number> = state?.flags?.blackholeCells ?? new Set<number>();
      const board = state?.board ?? [];
      const w = state?.config?.width ?? (board[0]?.length ?? 0);
      let count = 0;
      for (let y = 0; y < board.length; y++) {
        for (let x = 0; x < (board[y]?.length ?? 0); x++) {
          const c = board[y][x];
          if (!c) continue;
          const idx = y * w + x;
          if (bh.has(idx)) continue;
          if (Number(c.color) === Number(target)) count++;
        }
      }
      collected[target] = count;
      const prev = last[target] ?? 0;
      const delta = Math.max(0, count - prev);
      collectedDelta = {};
      if (delta > 0) collectedDelta[target] = delta;
      last[target] = count;
    }
  }

  function isVictory(): boolean {
    if (config.goal.type === "Score") {
      return score >= (config.goal as any).targetScore;
    }
    if (config.goal.type === "Collect") {
      const got = collected[config.goal.targetType] ?? 0;
      return got >= config.goal.count;
    }
    return false;
  }

  function getGoalUIModel() {
    const g: LevelGoal = config.goal;
    if (g.type === "Score") {
      return { kind: "Score", current: score, target: g.targetScore };
    }
    return { kind: "Collect", current: collected[(g as any).targetType] ?? 0, target: (g as any).count, type: (g as any).targetType };
    }

  function getCollectDelta() {
    return collectedDelta;
  }

  return { config, updateFromEngine, isVictory, getGoalUIModel, getCollectDelta };
}
