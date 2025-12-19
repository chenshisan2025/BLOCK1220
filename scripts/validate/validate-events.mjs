import { exists, read, fail, ok } from "./_util.mjs";

const mustFiles = [
  "src/content/events/event_campaigns_v1.json",
  "src/game/events/eventTypes.ts",
  "src/game/events/eventLoader.ts",
  "src/game/events/eventRuntime.ts",
  "app/api/events/active/route.ts",
  "app/api/events/progress/route.ts",
  "app/api/events/claim/route.ts",
  "app/api/admin/events/summary/route.ts",
];
for (const f of mustFiles) {
  if (!exists(f)) fail(`validate-events: missing ${f}`);
}
const migrateSql = read("src/server/db/pg_migrate.sql");
if (!migrateSql.includes("CREATE TABLE IF NOT EXISTS event_progress") || !migrateSql.includes("CREATE TABLE IF NOT EXISTS event_completions")) {
  fail("validate-events: pg_migrate.sql must include event_progress and event_completions tables");
}
const claimables = read("app/api/claimables/route.ts");
if (!claimables.includes("EventReward")) {
  fail("validate-events: claimables must include EventReward mapping from issued_rewards");
}
const uiFiles = ["app/admin/events/page.tsx", "src/game/ui/GameHUD.tsx", "src/game/pixi/PixiGame.tsx"];
for (const f of uiFiles) {
  if (!exists(f)) continue;
  const s = read(f);
  if (s.includes("Math.random") || s.includes("weight")) {
    fail(`validate-events: UI must not do draw/weight (found in ${f})`);
  }
}
const reportApiPath = "app/api/events/report/route.ts";
const eventRepoPath = "src/server/repo/eventRepo.ts";
if (!exists(reportApiPath)) fail("validate-events: missing /api/events/report route");
if (!exists(eventRepoPath)) fail("validate-events: missing eventRepoPg");
const reportApi = read(reportApiPath);
if (!reportApi.includes("eventRepoPg") && !reportApi.includes("upsertProgress")) {
  fail("validate-events: report API must call eventRepoPg().upsertProgress");
}
const serverSideActiveTokens = ["getActiveCampaigns", "listActiveEventCampaigns", "eventConfigRepoPg", "listActive"];
let hasActiveSel = false;
for (const tok of serverSideActiveTokens) {
  if (reportApi.includes(tok)) { hasActiveSel = true; break; }
}
if (!hasActiveSel) {
  fail("validate-events: report API must select active campaigns server-side (loader or DB repo)");
}
const eventRepo = read(eventRepoPath);
if (!eventRepo.includes("upsertProgress") || !eventRepo.includes("event_progress")) {
  fail("validate-events: eventRepo must upsert into event_progress");
}
const forbidUiTokens = ["requiredCount", "requiredRuns", "event_progress.current +", "INSERT INTO event_progress"];
const uiFiles2 = ["src/game/pixi/PixiGame.tsx", "src/game/ui/GameHUD.tsx", "src/game/session/GameSessionShell.tsx"];
for (const f of uiFiles2) {
  if (!exists(f)) continue;
  const s = read(f);
  for (const tok of forbidUiTokens) {
    if (s.includes(tok)) {
      fail(`validate-events: UI layer must not implement event rules/persistence. Token '${tok}' found in ${f}`);
    }
  }
}
const eventsPages = ["app/zh/events/page.tsx", "app/en/events/page.tsx"];
for (const p of eventsPages) {
  if (!exists(p)) fail(`validate-events: missing player events page ${p}`);
  const s = read(p);
  const must = ["/api/events/active", "/api/events/progress", "/api/events/claim", "NeonCard", "LOADING", "ERROR"];
  for (const t of must) if (!s.includes(t)) fail(`validate-events: ${p} missing token ${t}`);
  if (s.includes("Math.random") || s.includes("weight")) fail(`validate-events: ${p} must not do draw logic`);
  if (!s.includes("renderEventRuleSummary")) fail(`validate-events: ${p} must use renderEventRuleSummary for rule display`);
  const forbidden = ["requiredCount", "requiredRuns", "targetType ===", "specialType ==="];
  for (const tok of forbidden) {
    if (s.includes(tok)) fail(`validate-events: UI must not interpret rules (${tok}) in ${p}`);
  }
  if (!s.includes("renderEventBadges")) {
    fail(`validate-events: ${p} must use renderEventBadges to render visual labels`);
  }
}
ok("validate-events passed: event content+loader+runtime+APIs+DB tables exist, claimables maps EventReward, UI has no draw logic.");
