import { exists, read, fail, ok } from "./_util.mjs";

const REQUIRED_FILES = [
  "src/game/story/levelTypes.ts",
  "src/game/story/levelLoader.ts",
  "src/game/story/levelRuntime.ts",
  "src/game/story/boss/bossTypes.ts",
  "src/game/story/boss/bossRegistry.ts",
  "src/game/story/boss/bossMempoolFreeze.ts",
  "src/game/story/boss/bossBlackhole.ts",
  "src/game/story/boss/bossReentrancyRollback.ts",
  "src/game/session/GameSessionShell.tsx",
  "src/game/pixi/PixiGame.tsx",
  "src/game/pixi/CellSprite.ts",
  "src/mocks/story_levels_v1.json",
];
const missing = REQUIRED_FILES.filter((p) => !exists(p));
if (missing.length) {
  console.error("Missing required Story/Boss/Level files:");
  missing.forEach((m) => console.error(" - " + m));
  fail("validate-story failed (missing required files).");
}
const shell = read("src/game/session/GameSessionShell.tsx");
const pixiGame = read("src/game/pixi/PixiGame.tsx");
const registry = read("src/game/story/boss/bossRegistry.ts");
const cellSprite = read("src/game/pixi/CellSprite.ts");
const levelSignals = ["level=", "useSearchParams", "get(\"level\")", "get('level')", "levelId"];
if (!levelSignals.some((s) => shell.includes(s))) {
  fail("GameSessionShell.tsx must read story level from query (?level=) or set a default levelId.");
}
const loaderSignals = ["loadStoryLevels", "getLevel", "levelRuntime", "createLevelRuntime"];
if (!loaderSignals.some((s) => shell.includes(s))) {
  fail("GameSessionShell.tsx must use story level loader/runtime (levelLoader/levelRuntime).");
}
const bossRefs = ["bossMempoolFreeze", "bossBlackhole", "bossReentrancyRollback"];
for (const r of bossRefs) {
  if (!registry.includes(r)) {
    fail(`bossRegistry.ts must reference ${r} (registry gate).`);
  }
}
if (!pixiGame.includes("onSwapAttempt")) {
  fail("PixiGame.tsx must call bossController.onSwapAttempt(...) to gate swap attempts.");
}
if (!pixiGame.includes("getCellFlags")) {
  fail("PixiGame.tsx must call bossController.getCellFlags(index) to retrieve Frozen/Blackhole flags.");
}
const applySignals = ["setState(", "setFrozen", "setBlackhole", "flags.", "frozen", "blackhole"];
if (!applySignals.some((s) => pixiGame.includes(s))) {
  fail("PixiGame.tsx must apply boss cell flags to sprites (frozen/blackhole).");
}
for (const tok of ["setState", "frozen", "blackhole"]) {
  if (!cellSprite.includes(tok)) {
    fail(`CellSprite.ts must support Frozen/Blackhole overlays. Missing token: ${tok}`);
  }
}
const gfxSignals = [".rect(", ".circle(", ".roundRect(", ".stroke(", ".fill("];
if (!gfxSignals.some((s) => cellSprite.includes(s))) {
  fail("CellSprite.ts must visually render overlays using PIXI.Graphics.");
}
const forbiddenParamTokens = ["freezeCount", "intervalSec", "blackholeCount", "rollbackProbability", "rollbackChances"];
for (const tok of forbiddenParamTokens) {
  if (pixiGame.includes(tok)) {
    fail(`Boss params must not be hardcoded in PixiGame.tsx. Forbidden token found: ${tok}`);
  }
}
const telegraphSoftSignals = ["getTelegraph", "telegraph", "REVERT", "warning"];
if (!telegraphSoftSignals.some((s) => pixiGame.includes(s) || shell.includes(s) || cellSprite.includes(s))) {
  fail("Telegraph extensibility missing: expected getTelegraph/telegraph/REVERT warning signal.");
}
ok("validate-story v2 passed: level param wired, boss registry present, Pixi gating+flags applied, CellSprite overlays present, anti-drift enforced.");
// --- BossProfile parameterization gate (13-D.1) ---
if (!exists("src/mocks/boss_profiles_v1.json")) {
  fail("validate-story: missing src/mocks/boss_profiles_v1.json (BossProfile config required).");
}
const bossProfileFiles = ["src/game/story/boss/bossProfiles.ts", "src/game/story/boss/bossProfileLoader.ts"];
for (const f of bossProfileFiles) {
  if (!exists(f)) fail(`validate-story: missing ${f} (BossProfile loader/types required).`);
}
const ctrlFiles = [
  "src/game/story/boss/bossMempoolFreeze.ts",
  "src/game/story/boss/bossBlackhole.ts",
  "src/game/story/boss/bossReentrancyRollback.ts",
];
for (const f of ctrlFiles) {
  const s = read(f);
  if (!s.includes("profile") || !s.includes("profile.params")) {
    fail(`validate-story: ${f} must read parameters from profile.params (no hardcoded params).`);
  }
}
const hudPath = "src/game/ui/GameHUD.tsx";
if (!exists(hudPath)) fail("validate-story: missing GameHUD.tsx");
{
  const hud = read(hudPath);
  const telegraphTokens = ["telegraph", "messageKey", "secondsLeft"];
  for (const tok of telegraphTokens) {
    if (!hud.includes(tok)) {
      fail(`validate-story: GameHUD.tsx must render boss telegraph field: ${tok}`);
    }
  }
}
ok("validate-boss gate passed (profiles+loader/controllers use profile.params, HUD telegraph rendering).");
// BossCtx tokens presence
const ctxTokens = ["nowMs", "swapCount", "gridSize", "rng"];
for (const t of ctxTokens) {
  if (!pixiGame.includes(t) && !shell.includes(t)) {
    fail(`validate-story: BossCtx field ${t} not found in session/pixi wiring.`);
  }
}
// --- Blackhole rule must not be implemented in UI layer gate (13-D.2) ---
const forbidBlackholeRuleTokens = ["noScoreNoCollect", "if (blackhole", "if(blackhole", "blackholeCells.has(", "skipScore", "skipCollect"];
const uiFiles = ["src/game/pixi/PixiGame.tsx", "src/game/ui/GameHUD.tsx", "src/game/session/useGameSession.ts", "src/game/session/GameSessionShell.tsx"];
for (const f of uiFiles) {
  if (!exists(f)) continue;
  const s = read(f);
  for (const tok of forbidBlackholeRuleTokens) {
    if (s.includes(tok)) {
      fail(`validate-story: UI layer must not implement blackhole scoring/collect rules. Forbidden token '${tok}' found in ${f}`);
    }
  }
}
const scorer = read("src/game/engine/scorer.ts");
const runtime = read("src/game/story/levelRuntime.ts");
const engine = read("src/game/engine/engine.ts");
const mustHave = ["blackholeCells"];
if (!mustHave.some((t) => scorer.includes(t))) fail("validate-story: scorer.ts must reference blackholeCells");
if (!mustHave.some((t) => runtime.includes(t))) fail("validate-story: levelRuntime.ts must reference blackholeCells for Collect");
if (!mustHave.some((t) => engine.includes(t))) fail("validate-story: engine.ts must pass blackholeCells into scoring pipeline");
ok("blackhole rule gate passed (rules in Engine/runtime, not UI).");
