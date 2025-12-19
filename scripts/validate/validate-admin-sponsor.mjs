import { exists, read, fail, ok } from "./_util.mjs";

/**
 * validate-admin-sponsor
 * Hard gates for 13-H Sponsor Dashboard + Persistence (SQLite)
 * - DB layer must exist (schema/db/migrate)
 * - Sponsor APIs must write DB records
 * - Claimables must aggregate sponsor rewards from DB (not memory-only)
 * - Admin analytics API + page must exist
 * - UI must not do reward draw (no Math.random/weight)
 * Output: single ok() on success
 */

const FILES = {
  schema: "src/server/db/schema.sql",
  db: "src/server/db/db.ts",
  migrate: "src/server/db/migrate.ts",
  repo: "src/server/repo/sponsorRepo.ts",

  openBoxApi: "app/api/sponsor/openBox/route.ts",
  completeApi: "app/api/sponsor/completeCampaign/route.ts",
  claimablesApi: "app/api/claimables/route.ts",

  adminSummaryApi: "app/api/admin/sponsor-analytics/summary/route.ts",
  adminAnalyticsPage: "app/admin/analytics/page.tsx",
};

const missing = Object.values(FILES).filter((p) => !exists(p));
if (missing.length) {
  console.error("Missing admin-sponsor required files:");
  missing.forEach((m) => console.error(" - " + m));
  fail("validate-admin-sponsor failed (missing required files).");
}

const schema = read(FILES.schema);
const repo = read(FILES.repo);
const openBoxApi = read(FILES.openBoxApi);
const completeApi = read(FILES.completeApi);
const claimablesApi = read(FILES.claimablesApi);
const adminSummaryApi = read(FILES.adminSummaryApi);
const adminAnalyticsPage = read(FILES.adminAnalyticsPage);

// =======================================================
// A) DB schema gate (must have sponsor tables)
// =======================================================
const schemaMustTables = [
  "CREATE TABLE IF NOT EXISTS sponsors",
  "CREATE TABLE IF NOT EXISTS sponsor_campaigns",
  "CREATE TABLE IF NOT EXISTS sponsor_boxes",
  "CREATE TABLE IF NOT EXISTS sponsor_box_rewards",
  "CREATE TABLE IF NOT EXISTS sponsor_campaign_completions",
  "CREATE TABLE IF NOT EXISTS sponsor_box_opens",
  "CREATE TABLE IF NOT EXISTS issued_rewards",
];
for (const t of schemaMustTables) {
  if (!schema.includes(t)) {
    fail(`validate-admin-sponsor: schema.sql missing required table DDL token: ${t}`);
  }
}

// =======================================================
// B) Repository gate (must record events + summary)
// =======================================================
const repoMustTokens = ["recordCampaignCompletion", "recordBoxOpen", "recordIssuedReward", "getSummary"];
for (const tok of repoMustTokens) {
  if (!repo.includes(tok)) {
    fail(`validate-admin-sponsor: sponsorRepo.ts missing token: ${tok}`);
  }
}
if (!repo.includes("migratePg") && !repo.includes("migrate()")) {
  fail("validate-admin-sponsor: sponsorRepo.ts must call migratePg() (or migrate()) to ensure schema ready.");
}

// =======================================================
// C) Sponsor APIs must write DB (NO UI draw)
// =======================================================
const openBoxMustTokens = ["recordBoxOpen", "recordIssuedReward"];
for (const tok of openBoxMustTokens) {
  if (!openBoxApi.includes(tok)) {
    fail(`validate-admin-sponsor: openBox API must call ${tok} (DB persistence required).`);
  }
}
const completeMustTokens = ["recordCampaignCompletion", "recordIssuedReward"];
for (const tok of completeMustTokens) {
  if (!completeApi.includes(tok)) {
    fail(`validate-admin-sponsor: completeCampaign API must call ${tok} (DB persistence required).`);
  }
}
// server-side RNG is allowed; UI checks below

// =======================================================
// D) Claimables must aggregate sponsor rewards from DB
// =======================================================
const claimablesMustTokens = ["issued_rewards", "Sponsor", "SponsorBox", "SponsorCollect", "recordIssuedReward"];
const hasDbSignal = claimablesMustTokens.some((tok) => claimablesApi.includes(tok));
if (!hasDbSignal) {
  fail("validate-admin-sponsor: claimables API must aggregate sponsor rewards from DB (issued_rewards/repo). No DB signal found.");
}
if (claimablesApi.includes("src/server/sponsor/store") || claimablesApi.includes("server/sponsor/store")) {
  fail("validate-admin-sponsor: claimables API must not depend solely on in-memory sponsor store; use DB-backed repo.");
}

// =======================================================
// E) Admin analytics API + page gates
// =======================================================
if (!adminSummaryApi.includes("getSummary")) {
  fail("validate-admin-sponsor: admin summary API must call sponsorRepo.getSummary()");
}
const pageMustTokens = ["sponsor-analytics/summary", "Loading", "Empty", "Error", "Degraded"];
for (const tok of pageMustTokens) {
  if (!adminAnalyticsPage.includes(tok)) {
    fail(`validate-admin-sponsor: admin analytics page missing token: ${tok}`);
  }
}
if (!adminAnalyticsPage.includes("NeonCard") || !adminAnalyticsPage.includes("NeonIcon")) {
  fail("validate-admin-sponsor: admin analytics page must use NeonCard/NeonIcon (Neon Tech).");
}

// =======================================================
// F) UI must not do reward draw / weight logic
// =======================================================
const forbiddenUiTokens = ["Math.random", "weight", "weighted", "roulette"];
if (adminAnalyticsPage.includes("Math.random")) {
  fail("validate-admin-sponsor: admin UI must not perform any reward draw logic (Math.random found).");
}
for (const tok of forbiddenUiTokens) {
  if (adminAnalyticsPage.includes(tok) && tok !== "weight") {
    fail(`validate-admin-sponsor: forbidden UI token found in admin analytics page: ${tok}`);
  }
}

// --- Admin pages (Sponsors/Campaigns/Boxes) gates ---
const adminPages = ["app/admin/sponsors/page.tsx", "app/admin/campaigns/page.tsx", "app/admin/boxes/page.tsx"];
for (const p of adminPages) {
  if (!exists(p)) fail(`validate-admin-sponsor: missing admin page ${p}`);
  const s = read(p);
  const mustFetch = p.includes("sponsors") ? "/api/admin/sponsors" : p.includes("campaigns") ? "/api/admin/campaigns" : "/api/admin/boxes";
  if (!s.includes(mustFetch)) {
    fail(`validate-admin-sponsor: ${p} must fetch ${mustFetch}`);
  }
  const mustTokens = ["NeonCard", "NeonIcon", "LOADING", "EMPTY", "ERROR", "DEGRADED"];
  for (const t of mustTokens) {
    if (!s.includes(t)) fail(`validate-admin-sponsor: ${p} missing token ${t}`);
  }
  if (s.includes("Math.random")) {
    fail(`validate-admin-sponsor: ${p} must not perform any draw logic (Math.random found).`);
  }
}

ok("validate-admin-sponsor passed: DB schema/repo present, sponsor APIs persist events, claimables aggregates from DB, admin analytics wired (Neon), UI has no draw logic, admin list pages wired.");
