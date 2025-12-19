import { exists, read, fail, ok } from "./_util.mjs";

const mustFiles = ["src/game/ui/GameHUD.tsx", "src/game/ui/useHudModel.ts", "src/game/pixi/PixiGame.tsx"];
for (const f of mustFiles) {
  if (!exists(f)) fail(`validate-hud: missing file ${f}`);
}
const hud = read("src/game/ui/GameHUD.tsx");
const model = read("src/game/ui/useHudModel.ts");
const pixiGame = read("src/game/pixi/PixiGame.tsx");
const forbidden = ["findMatches", "matcher", "engine/matcher"];
for (const tok of forbidden) {
  if (hud.includes(tok) || model.includes(tok)) {
    fail(`validate-hud: HUD must not touch rule logic. Found token: ${tok}`);
  }
}
if (!pixiGame.includes("<GameHUD") && !pixiGame.includes("GameHUD(")) {
  fail("validate-hud: PixiGame must render <GameHUD /> overlay");
}
ok("validate-hud passed (HUD exists, read-only, PixiGame renders it).");
