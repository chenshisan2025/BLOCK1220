import type { BossController } from "./bossTypes";
import type { BossProfile } from "./bossProfiles";
import { getBossProfile } from "./bossProfileLoader";
import { createBossMempoolFreeze } from "./bossMempoolFreeze";
import { createBossBlackhole } from "./bossBlackhole";
import { createBossReentrancyRollback } from "./bossReentrancyRollback";

export function createBossControllerByProfileId(bossProfileId: string): { profile: BossProfile; controller: BossController } {
  const profile = getBossProfile(bossProfileId);
  const controller = createBossController(profile);
  return { profile, controller };
}

export function createBossController(profile: BossProfile): BossController {
  switch (profile.bossType) {
    case "freeze":
      return createBossMempoolFreeze(profile);
    case "blackhole":
      return createBossBlackhole(profile);
    case "rollback":
      return createBossReentrancyRollback(profile);
    default:
      return createBossMempoolFreeze(profile as any);
  }
}
