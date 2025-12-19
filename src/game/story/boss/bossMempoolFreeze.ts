import type { BossController, BossTelegraph, BossCtx } from "./bossTypes";
import type { BossProfile } from "./bossProfiles";

type FreezeProfile = Extract<BossProfile, { bossType: "freeze" }>;

export function createBossMempoolFreeze(profile: FreezeProfile): BossController {
  const { freezeCount, intervalSec, telegraphSec } = profile.params;
  const frozen = new Set<number>();
  let elapsedMs = 0;
  let lastTriggerMs = 0;
  let telegraph: BossTelegraph | null = null;
  return {
    onTick(dtMs: number, ctx: BossCtx) {
      elapsedMs += dtMs;
      const nextAt = lastTriggerMs + intervalSec * 1000;
      const leftSec = Math.max(0, Math.ceil((nextAt - elapsedMs) / 1000));
      telegraph = leftSec <= telegraphSec ? { kind: "freeze", secondsLeft: leftSec, messageKey: "boss.freeze.incoming", severity: "warn" } : null;
      if (elapsedMs >= nextAt) {
        lastTriggerMs = elapsedMs;
        const total = ctx.gridSize * ctx.gridSize;
        while (frozen.size < Math.min(total, freezeCount)) {
          const idx = Math.floor((ctx.rng?.() ?? Math.random()) * total);
          frozen.add(idx);
        }
      }
    },
    onSwapAttempt(aIdx: number, bIdx: number, ctx: BossCtx) {
      if (frozen.has(aIdx) || frozen.has(bIdx)) return { allow: false, reason: "FROZEN" };
      return { allow: true };
    },
    getCellFlags(index) {
      return { frozen: frozen.has(index) };
    },
    getTelegraph() {
      return telegraph;
    },
  };
}
