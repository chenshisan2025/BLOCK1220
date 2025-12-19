import { exists, read, fail, ok } from "./_util.mjs";

const contentFiles = [
  "src/content/sponsor/sponsors_v1.json",
  "src/content/sponsor/sponsor_campaigns_v1.json",
  "src/content/sponsor/sponsor_boxes_v1.json",
];
for (const f of contentFiles) {
  if (!exists(f)) fail(`validate-sponsor: missing ${f}`);
}
const levelsPath = "src/content/story/story_levels_v1.json";
if (!exists(levelsPath)) fail("validate-sponsor: missing story levels");
const levels = JSON.parse(read(levelsPath));
const campaigns = JSON.parse(read("src/content/sponsor/sponsor_campaigns_v1.json"));
const boxes = JSON.parse(read("src/content/sponsor/sponsor_boxes_v1.json"));
const campaignIds = new Set((campaigns.campaigns || []).map((c) => c.campaignId));
const boxIds = new Set((boxes.boxes || []).map((b) => b.boxId));
for (const lv of levels.levels || []) {
  if (lv.sponsor) {
    if (lv.sponsor.campaignId && !campaignIds.has(lv.sponsor.campaignId)) fail(`validate-sponsor: level ${lv.levelId} references unknown campaignId ${lv.sponsor.campaignId}`);
    if (lv.sponsor.boxId && !boxIds.has(lv.sponsor.boxId)) fail(`validate-sponsor: level ${lv.levelId} references unknown boxId ${lv.sponsor.boxId}`);
  }
}
const uiFiles = [
  "src/game/ui/GameHUD.tsx",
  "src/game/session/GameSessionShell.tsx",
  "src/game/pixi/PixiGame.tsx",
];
for (const f of uiFiles) {
  const s = read(f);
  if (s.includes("Math.random") || s.includes("weight")) {
    fail(`validate-sponsor: Sponsor reward draw must not happen in UI (${f})`);
  }
}
const apiOpen = "app/api/sponsor/openBox/route.ts";
const apiComplete = "app/api/sponsor/completeCampaign/route.ts";
if (!exists(apiOpen) || !exists(apiComplete)) fail("validate-sponsor: missing sponsor APIs");
const claimables = read("app/api/claimables/route.ts");
if (!claimables.includes("Sponsor Box Reward") || !claimables.includes("Sponsor Collect Reward")) {
  fail("validate-sponsor: claimables must include Sponsor rewards from API injection");
}
ok("validate-sponsor passed: sponsor content exists, references valid, UI no RNG/weights, APIs present, claimables include sponsor rewards.");
