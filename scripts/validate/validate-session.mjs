import { exists, read, fail, ok } from "./_util.mjs";

const mustFiles = [
  "src/game/session/mode.ts",
  "src/game/session/useGameSession.ts",
  "src/game/session/GameSessionShell.tsx",
  "src/game/session/ReviveModal.tsx",
  "src/game/session/GameOverModal.tsx",
  "app/zh/play/game/page.tsx",
  "app/en/play/game/page.tsx",
  "src/game/pixi/PixiGame.tsx",
];
for (const f of mustFiles) {
  if (!exists(f)) fail(`validate-session: missing file ${f}`);
}
const zhPage = read("app/zh/play/game/page.tsx");
const enPage = read("app/en/play/game/page.tsx");
if (!zhPage.includes("GameSessionShell") || !enPage.includes("GameSessionShell")) {
  fail("validate-session: /play/game pages must render GameSessionShell");
}
const pixi = read("src/game/pixi/PixiGame.tsx");
if (!pixi.includes("mode:")) {
  fail("validate-session: PixiGame must accept mode props (mode: \"story\" | \"endless\")");
}
const hud = exists("src/game/ui/GameHUD.tsx") ? read("src/game/ui/GameHUD.tsx") : "";
const model = exists("src/game/ui/useHudModel.ts") ? read("src/game/ui/useHudModel.ts") : "";
const forbidden = ["findMatches", "matcher"];
for (const tok of forbidden) {
  if (hud.includes(tok) || model.includes(tok)) {
    fail(`validate-session: HUD must remain read-only. Forbidden token: ${tok}`);
  }
}
ok("validate-session passed (session files exist, pages render shell, PixiGame receives mode, HUD read-only).");
