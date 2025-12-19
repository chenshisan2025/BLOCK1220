import { exists, read, fail, ok } from "./_util.mjs";

const sm = read("src/lib/audio/SoundManager.ts");
if (!sm.includes("isUnlocked(") || !sm.includes("initOnFirstGesture(")) {
  fail("validate-audio-telemetry: SoundManager must include isUnlocked and initOnFirstGesture");
}
const hud = read("src/game/ui/GameHUD.tsx");
const revive = read("src/game/session/ReviveModal.tsx");
const over = read("src/game/session/GameOverModal.tsx");
if (![hud, revive, over].some((s) => s.includes("SoundManager.get().initOnFirstGesture"))) {
  fail("validate-audio-telemetry: at least one user gesture entry must call initOnFirstGesture");
}
const runApi = read("app/api/leaderboard/run/route.ts");
if (!runApi.includes("telemetry")) {
  fail("validate-audio-telemetry: leaderboard/run must accept/use telemetry");
}
const badZeros = ["swapsTotal: 0", "swapsValid: 0", "cascadesTotal: 0", "specialsTotal: 0"];
if (badZeros.some((k) => runApi.includes(k))) {
  fail("validate-audio-telemetry: leaderboard/run must not hardcode telemetry zeros");
}
ok("validate-audio-telemetry passed: audio unlock + user gesture call + telemetry used in leaderboard/run");
