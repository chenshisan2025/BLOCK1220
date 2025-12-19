export type GameMode = "story" | "endless";

export function useHudModel(input: { mode: GameMode; state: any | null }) {
  const s = input.state;
  const timeMs = typeof s?.timeLeft === "number" ? s.timeLeft : 0;
  const timeSeconds = timeMs > 1000 ? Math.ceil(timeMs / 1000) : Math.max(0, Math.floor(timeMs));
  const score = Number(s?.score ?? s?.rawScore ?? 0);
  const combo = Number(s?.combo ?? 0);
  const showCombo = combo >= 2;
  const isTimeCritical = timeSeconds <= 10;
  const hashSurge = {
    active: input.mode === "endless" && Boolean(s?.hashSurgeActive),
    stacks: s?.hashSurgeStacks ?? 0,
    secondsLeft: s?.hashSurgeLeft ?? 0,
  };
  return { timeSeconds, isTimeCritical, score, combo, showCombo, hashSurge };
}
