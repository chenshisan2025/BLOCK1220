import type { BossController, BossTelegraph, BossCtx } from "./bossTypes";
import type { BossProfile } from "./bossProfiles";
type BlackholeProfile = Extract<BossProfile, { bossType: "blackhole" }>;

export function createBossBlackhole(profile: BlackholeProfile): BossController {
  const { blackholeCount, spawnIntervalSec, telegraphSec } = profile.params;
  const holes = new Set<number>();
  let elapsedMs = 0;
  let lastSpawnMs = 0;
  let telegraph: BossTelegraph | null = null;
  return {
    onTick(dtMs: number, ctx: BossCtx) {
      elapsedMs += dtMs;
      const nextAt = lastSpawnMs + spawnIntervalSec * 1000;
      const leftSec = Math.max(0, Math.ceil((nextAt - elapsedMs) / 1000));
      telegraph = leftSec <= telegraphSec ? { kind: "blackhole", secondsLeft: leftSec, messageKey: "boss.blackhole.incoming", severity: "warn" } : null;
      if (elapsedMs >= nextAt) {
        lastSpawnMs = elapsedMs;
        holes.clear();
        const total = ctx.gridSize * ctx.gridSize;
        while (holes.size < Math.min(total, blackholeCount)) {
          holes.add(Math.floor((ctx.rng?.() ?? Math.random()) * total));
        }
      }
    },
    onSwapAttempt(aIdx: number, bIdx: number) {
      if (holes.has(aIdx) || holes.has(bIdx)) return { allow: false, reason: "BLACKHOLE" };
      return { allow: true };
    },
    getCellFlags(index) {
      return { blackhole: holes.has(index) };
    },
    getTelegraph() {
      return telegraph;
    },
  };
}
