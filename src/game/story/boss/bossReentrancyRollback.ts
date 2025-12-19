import type { BossController, BossTelegraph, BossCtx } from "./bossTypes";
import type { BossProfile } from "./bossProfiles";
type RollbackProfile = Extract<BossProfile, { bossType: "rollback" }>;

export function createBossReentrancyRollback(profile: RollbackProfile): BossController {
  let left = Number(profile.params.rollbackChances);
  const telegraphSec = Number(profile.params.telegraphSec);
  const messageKey = profile.params.messageKey;
  let elapsedMs = 0;
  let swapCounter = 0;
  let telegraph: BossTelegraph | null = null;
  const everyN = profile.params.triggerEveryNSwaps ?? 0;
  return {
    onTick(dtMs: number) {
      elapsedMs += dtMs;
      if (left > 0) {
        telegraph = { kind: "rollback", secondsLeft: telegraphSec, messageKey, severity: "danger" };
      } else {
        telegraph = null;
      }
    },
    onSwapAttempt(aIdx: number, bIdx: number, ctx: BossCtx) {
      swapCounter++;
      if (left > 0 && everyN > 0 && swapCounter % everyN === 0) {
        left--;
        return { allow: false, reason: "REVERT" };
      }
      return { allow: true };
    },
    getCellFlags() {
      return {};
    },
    getTelegraph() {
      return telegraph;
    },
  };
}
