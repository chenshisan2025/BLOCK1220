import type { BossProfile, BossProfilesFile } from "./bossProfiles";
import profilesJson from "../../../mocks/boss_profiles_v1.json";

let cache: Map<string, BossProfile> | null = null;

export function loadBossProfiles(): Map<string, BossProfile> {
  if (cache) return cache;
  const file = profilesJson as unknown as BossProfilesFile;
  const m = new Map<string, BossProfile>();
  for (const p of file.profiles || []) {
    if (!p?.bossProfileId) continue;
    m.set(p.bossProfileId, p as BossProfile);
  }
  cache = m;
  return m;
}

export function getBossProfile(bossProfileId: string): BossProfile {
  const m = loadBossProfiles();
  const p = m.get(bossProfileId);
  if (!p) {
    throw new Error(`BossProfile not found: ${bossProfileId}`);
  }
  return p;
}
