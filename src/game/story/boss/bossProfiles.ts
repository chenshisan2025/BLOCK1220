export type BossType = "freeze" | "blackhole" | "rollback";

export type FreezeParams = {
  freezeCount: number;
  intervalSec: number;
  telegraphSec: number;
  unfreezeByAdjacency: boolean;
};

export type BlackholeParams = {
  blackholeCount: number;
  spawnIntervalSec: number;
  telegraphSec: number;
  consumeRule: "vanish" | "noScoreNoCollect";
};

export type RollbackParams = {
  rollbackChances: number;
  telegraphSec: number;
  messageKey: string;
  triggerEveryNSwaps?: number;
  rollbackProbability?: number;
};

export type BossProfile =
  | { bossProfileId: string; bossType: "freeze"; params: FreezeParams }
  | { bossProfileId: string; bossType: "blackhole"; params: BlackholeParams }
  | { bossProfileId: string; bossType: "rollback"; params: RollbackParams };

export type BossProfilesFile = { version: string; profiles: BossProfile[] };
