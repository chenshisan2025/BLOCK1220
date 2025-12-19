import { exists, read, fail, ok } from "./_util.mjs";

const mustFiles = [
  "src/game/session/runResult.ts",
  "app/api/leaderboard/run/route.ts",
  "app/api/leaderboard/daily/route.ts",
  "app/en/leaderboard/page.tsx",
  "app/zh/leaderboard/page.tsx",
  "app/api/claimables/route.ts",
];
for (const f of mustFiles) {
  if (!exists(f)) fail(`validate-leaderboard: missing ${f}`);
}
const shell = read("src/game/session/GameSessionShell.tsx");
const runType = read("src/game/session/runResult.ts");
if (!shell.includes("rankScore") || !shell.includes("Math.floor((hud.score * 60) / effectiveTime)")) {
  fail("validate-leaderboard: Session must compute RankScore = floor(rawScore * 60 / effectiveTimeSec)");
}
if (!runType.includes("rankScore")) {
  fail("validate-leaderboard: RunResult type must include rankScore");
}
const enPage = read("app/en/leaderboard/page.tsx");
const zhPage = read("app/zh/leaderboard/page.tsx");
const forbidSortTokens = [".sort(", "sort(", "sorted", "orderBy"];
for (const tok of forbidSortTokens) {
  if (enPage.includes(tok) || zhPage.includes(tok)) {
    fail(`validate-leaderboard: Frontend must not sort leaderboard (token: ${tok})`);
  }
}
const dailyApi = read("app/api/leaderboard/daily/route.ts");
if (!dailyApi.includes("entries")) {
  fail("validate-leaderboard: /api/leaderboard/daily must return entries with RankScore");
}
const claimApi = read("app/api/claimables/route.ts");
if (!claimApi.includes("DailyRank")) {
  fail("validate-leaderboard: /api/claimables must include DailyRank claim items when settlement exists");
}
ok("validate-leaderboard passed: Endless RunResult/RankScore wiring, APIs present, UI not sorting, claimables include DailyRank.");
