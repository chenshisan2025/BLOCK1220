import { exists, read, fail, ok } from "./_util.mjs";

const LEVELS_PATH = "src/content/story/story_levels_v1.json";
const BOSSES_PATH = "src/mocks/boss_profiles_v1.json";

if (!exists(LEVELS_PATH)) fail(`validate-levels: missing ${LEVELS_PATH}`);
if (!exists(BOSSES_PATH)) fail(`validate-levels: missing ${BOSSES_PATH}`);

const levelsFile = JSON.parse(read(LEVELS_PATH));
const bossFile = JSON.parse(read(BOSSES_PATH));

const levels = levelsFile.levels;
if (!Array.isArray(levels)) fail("validate-levels: levels must be an array");
if (levels.length !== 100) fail(`validate-levels: levels length must be 100, got ${levels.length}`);

const bossIds = new Set((bossFile.profiles || []).map((p) => p.bossProfileId));

const seen = new Set();
const chapterCount = new Map();

for (const lv of levels) {
  const id = lv.levelId;
  if (typeof id !== "number") fail("validate-levels: levelId must be number");
  if (id < 1 || id > 100) fail(`validate-levels: levelId out of range: ${id}`);
  if (seen.has(id)) fail(`validate-levels: duplicate levelId: ${id}`);
  seen.add(id);

  const ch = lv.chapter;
  if (typeof ch !== "number" || ch < 1 || ch > 10) fail(`validate-levels: invalid chapter for level ${id}`);
  chapterCount.set(ch, (chapterCount.get(ch) || 0) + 1);

  if (lv.mode !== "story") fail(`validate-levels: level ${id} mode must be "story"`);

  const gridSize = lv.gridSize;
  if (![6, 7].includes(gridSize)) fail(`validate-levels: level ${id} gridSize must be 6 or 7`);

  const colorsCount = lv.colorsCount;
  if (typeof colorsCount !== "number" || colorsCount < 3 || colorsCount > 6) {
    fail(`validate-levels: level ${id} colorsCount must be 3..6`);
  }

  if (!bossIds.has(lv.bossProfileId)) {
    fail(`validate-levels: level ${id} bossProfileId not found in boss_profiles_v1.json: ${lv.bossProfileId}`);
  }

  const seed = lv.seedRules;
  if (typeof seed !== "number") fail(`validate-levels: level ${id} seedRules must be number`);

  const goal = lv.goal;
  if (!goal || typeof goal !== "object") fail(`validate-levels: level ${id} missing goal`);
  if (goal.type === "Score") {
    if (typeof goal.targetScore !== "number" || goal.targetScore <= 0) {
      fail(`validate-levels: level ${id} invalid targetScore`);
    }
  } else if (goal.type === "Collect") {
    if (typeof goal.targetType !== "number") fail(`validate-levels: level ${id} invalid collect.targetType`);
    if (typeof goal.count !== "number" || goal.count <= 0) fail(`validate-levels: level ${id} invalid collect.count`);
  } else {
    fail(`validate-levels: level ${id} invalid goal.type`);
  }
}

for (let i = 1; i <= 100; i++) {
  if (!seen.has(i)) fail(`validate-levels: missing levelId ${i}`);
}

for (let ch = 1; ch <= 10; ch++) {
  const c = chapterCount.get(ch) || 0;
  if (c !== 10) fail(`validate-levels: chapter ${ch} must have 10 levels, got ${c}`);
}

ok("validate-story-levels passed: 100 levels, ids 1..100, chapters 10x10, bossProfileId valid, goal/schema valid.");
