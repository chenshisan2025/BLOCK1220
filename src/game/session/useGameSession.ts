import type { GameMode } from "./mode";
import { STORY_MODE, ENDLESS_MODE } from "./mode";

export type SessionState = "RUNNING" | "TIME_UP" | "VICTORY" | "GAME_OVER";

export function useGameSession(input: { mode: GameMode }) {
  const cfg = input.mode === "endless" ? ENDLESS_MODE : STORY_MODE;
  let state: SessionState = "RUNNING";
  let revivesUsed = 0;
  const reviveMax = cfg.reviveMax;
  let lastEngine: any = null;
  let reviveToken = 0;
  let endToken = 0;

  function onEngineState(s: any) {
    lastEngine = s;
    const timeSeconds = Math.max(0, Math.floor((s?.timeLeft ?? 0) / 1000));
    if (state === "RUNNING" && timeSeconds <= 0) {
      state = "TIME_UP";
    }
    if (input.mode === "story") {
      const target = STORY_MODE.goal.targetScore;
      const raw = Number(s?.score ?? 0);
      if (raw >= target) {
        state = "VICTORY";
      }
    }
  }

  function canRevive() {
    return revivesUsed < reviveMax;
  }
  function doRevive() {
    if (!canRevive()) return;
    revivesUsed++;
    reviveToken++;
    state = "RUNNING";
  }
  function endRun() {
    state = "GAME_OVER";
    endToken++;
  }

  const timeSeconds = Math.max(0, Math.floor((lastEngine?.timeLeft ?? 0) / 1000));
  const effectiveTimeSeconds = cfg.limitSeconds + revivesUsed * cfg.reviveAddSeconds;
  const rawScore = Number(lastEngine?.score ?? 0);
  const rankScore = input.mode === "endless" ? Math.floor((rawScore * 60) / effectiveTimeSeconds) : 0;
  const combo = Number(lastEngine?.combo ?? 0);
  const hashSurge = {
    active: input.mode === "endless" && Boolean(lastEngine?.hashSurgeActive),
    stacks: lastEngine?.hashSurgeStacks ?? 0,
    secondsLeft: lastEngine?.hashSurgeLeft ?? 0,
  };

  return {
    mode: input.mode,
    session: state,
    reviveMax,
    revivesUsed,
    canRevive,
    doRevive,
    endRun,
    reviveToken,
    endToken,
    timeSeconds,
    effectiveTimeSeconds,
    rawScore,
    rankScore,
    combo,
    hashSurge,
    onEngineState,
    reviveAddMs: cfg.reviveAddSeconds * 1000,
  };
}

