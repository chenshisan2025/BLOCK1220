export type BossTelegraph = {
  kind: "freeze" | "blackhole" | "rollback";
  secondsLeft: number;
  messageKey: string;
  severity: "info" | "warn" | "danger";
};

export type BossCtx = {
  nowMs: number;
  swapCount: number;
  gridSize: number;
  rng: () => number;
};

export type BossController = {
  onTick: (dtMs: number, ctx: BossCtx) => void;
  onSwapAttempt: (aIdx: number, bIdx: number, ctx: BossCtx) => { allow: boolean; reason?: string };
  getCellFlags: (index: number) => { frozen?: boolean; blackhole?: boolean };
  getTelegraph: () => BossTelegraph | null;
};
