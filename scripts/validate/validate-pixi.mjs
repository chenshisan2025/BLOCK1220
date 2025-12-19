import { exists, read, fail, ok } from "./_util.mjs";

/**
 * validate-pixi v2
 * Purpose:
 *  - Enforce Pixi layer discipline for Tasks 13-B.2 / 13-B.3 / 13-B.4
 *  - Prevent UI from re-implementing engine rules
 *  - Guarantee animation / trigger / special pipelines exist
 */

const FILES = {
  pixiGame: "src/game/pixi/PixiGame.tsx",
  animations: "src/game/pixi/Animations.ts",
  input: "src/game/pixi/InputController.ts",
  board: "src/game/pixi/BoardRenderer.ts",
  cellSprite: "src/game/pixi/CellSprite.ts",
};

for (const p of Object.values(FILES)) {
  if (!exists(p)) fail(`validate-pixi: missing required file: ${p}`);
}

const pixiGame = read(FILES.pixiGame);
const animations = read(FILES.animations);
const input = read(FILES.input);
const board = read(FILES.board);
const cellSprite = read(FILES.cellSprite);

// A) Swap / Animation base gate (13-B.2)
const mustAnimExports = ["animateSwap", "animateSwapBack", "animateClear", "animateDrop"];
for (const fn of mustAnimExports) {
  if (!animations.includes(`function ${fn}`)) fail(`Animations.ts must export Promise function ${fn}`);
}
if (!pixiGame.includes("animatingRef") && !pixiGame.includes("isAnimating")) {
  fail("PixiGame.tsx must include animation input lock (animatingRef / isAnimating)");
}
if (!board.includes("getSpriteById")) {
  fail("BoardRenderer.ts must expose getSpriteById(cellId)");
}
const forbiddenEngineCalls = ["engineStep", "engine.swap", "engineSwap", "findMatches"];
for (const tok of forbiddenEngineCalls) {
  if (input.includes(tok)) fail(`InputController.ts must be intent-only; forbidden token found: ${tok}`);
}

// B) Clear / Drop pipeline gate (13-B.3)
const mustPipelineTokens = ["computeClearIds", "computeMovedIds", "getLastGridPositions", "animateClear", "animateDrop", "board.render(nextState"];
for (const tok of mustPipelineTokens) {
  if (!pixiGame.includes(tok)) fail(`PixiGame.tsx missing required clear/drop pipeline token: ${tok}`);
}
if (!pixiGame.includes("fromY") && !pixiGame.includes("-cellSize")) {
  fail("PixiGame.tsx must place new sprites from top (fromY = -cellSize)");
}
if (!pixiGame.includes("new Map(board.getLastGridPositions")) {
  fail("PixiGame.tsx must snapshot prevGridPos using new Map(...) before render(nextState)");
}

// C) Special animation gate (13-B.4)
const specialAnimCalls = ["animateSpecialLine", "animateSpecialBomb", "animateSpecialColor"];
for (const fn of specialAnimCalls) {
  if (!pixiGame.includes(fn)) fail(`PixiGame.tsx must call ${fn} for special animations`);
}
const mustCellTokens = ["setState", "special", "Line", "Bomb", "Color"];
for (const tok of mustCellTokens) {
  if (!cellSprite.includes(tok)) fail(`CellSprite.ts must support special rendering; missing token: ${tok}`);
}

// D) Trigger detection discipline (13-B.4)
const triggerFn = "detectSpecialTriggersFromClears";
if (
  !pixiGame.includes(`function ${triggerFn}`) &&
  !pixiGame.includes(`const ${triggerFn}`) &&
  !pixiGame.includes(`import { ${triggerFn}`) &&
  !pixiGame.includes(`import ${triggerFn}`)
) {
  fail(`PixiGame.tsx must define or import ${triggerFn}`);
}
if (!pixiGame.includes(`${triggerFn}(`)) {
  fail(`PixiGame.tsx must call ${triggerFn}(...) in cascade pipeline`);
}
if (!pixiGame.includes("clearIds") && !pixiGame.includes("computeClearIds")) {
  fail("Special trigger detection must be driven by clearIds (engine signal)");
}

// E) Absolute rule: UI must NOT touch matcher / rules
const forbiddenMatcherTokens = ["findMatches", "matcher", "engine/matcher", "src/game/engine/matcher"];
for (const tok of forbiddenMatcherTokens) {
  if (pixiGame.includes(tok)) fail(`PixiGame.tsx must not reference matcher or rule logic. Forbidden token: ${tok}`);
}

ok("validate-pixi v2 passed: Pixi layer discipline enforced (swap, clear/drop, special, triggers, no-rule-in-UI).");
