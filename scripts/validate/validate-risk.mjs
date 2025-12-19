import { exists, read, fail, ok } from "./_util.mjs";

const required = [
  "src/server/risk/riskModel.ts",
  "src/server/repo/antiCheatRepo.ts",
  "src/server/db/pg_migrate.sql",
  "app/api/admin/risk/summary/route.ts",
  "app/api/admin/risk/runs/route.ts",
  "app/api/admin/risk/address/route.ts",
  "app/api/admin/risk/reviews/open/route.ts",
  "app/api/admin/risk/reviews/resolve/route.ts",
  "app/admin/risk/page.tsx",
  "app/admin/risk/runs/page.tsx",
  "app/admin/risk/address/page.tsx",
];
for (const f of required) if (!exists(f)) fail(`validate-risk: missing ${f}`);

const migrate = read("src/server/db/pg_migrate.sql");
const mustTables = ["anti_cheat_runs", "anti_cheat_addresses", "anti_cheat_reviews"];
for (const t of mustTables) {
  if (!migrate.includes(t)) fail(`validate-risk: pg_migrate.sql must include ${t}`);
}

const runApi = read("app/api/leaderboard/run/route.ts");
if (!runApi.includes("evaluateRisk") || !runApi.includes("antiCheatRepoPg") || !runApi.includes("recordRun")) {
  fail("validate-risk: leaderboard/run must call evaluateRisk and recordRun via antiCheatRepo");
}
if (!runApi.includes('risk.decision === "allow"')) {
  fail("validate-risk: leaderboard/run must gate leaderboard submission by decision===allow");
}

const claimApi = read("app/api/events/claim/route.ts");
if (!claimApi.includes("antiCheatRepoPg") || (!claimApi.includes("RISK_DENIED") && !claimApi.includes("PENDING_REVIEW"))) {
  fail("validate-risk: events/claim must implement risk gating (deny/review)");
}
const openBoxApi = read("app/api/sponsor/openBox/route.ts");
const compApi = read("app/api/sponsor/completeCampaign/route.ts");
for (const [name, s] of [
  ["openBox", openBoxApi],
  ["completeCampaign", compApi],
]) {
  if (!s.includes("antiCheatRepoPg") || (!s.includes("RISK_DENIED") && !s.includes("PENDING_REVIEW"))) {
    fail(`validate-risk: sponsor/${name} must implement risk gating`);
  }
}

const adminPages = ["app/admin/risk/page.tsx", "app/admin/risk/runs/page.tsx", "app/admin/risk/address/page.tsx"];
for (const p of adminPages) {
  const s = read(p);
  const must = ["NeonCard", "LOADING", "ERROR", "EMPTY"];
  for (const tok of must) if (!s.includes(tok)) fail(`validate-risk: ${p} missing ${tok}`);
  if (s.includes("Math.random") || s.includes("weight")) fail(`validate-risk: ${p} must not do draw logic`);
}
const mustPendingApis = [
  "app/api/admin/risk/pending/list/route.ts",
  "app/api/admin/risk/pending/issue/route.ts",
  "app/api/admin/risk/pending/deny/route.ts",
  "app/api/admin/risk/reviews/resolveAndIssue/route.ts",
];
for (const f of mustPendingApis) if (!exists(f)) fail(`validate-risk: missing pending payout api ${f}`);
if (!exists("src/server/repo/pendingRewardRepo.ts")) fail("validate-risk: missing pendingRewardRepo");
if (!migrate.includes("CREATE TABLE IF NOT EXISTS pending_rewards")) {
  fail("validate-risk: pg_migrate.sql must include pending_rewards table");
}
if (!exists("app/admin/risk/pending/page.tsx")) fail("validate-risk: missing admin pending payouts page");
const pendingRepo = read("src/server/repo/pendingRewardRepo.ts");
if (!pendingRepo.includes("listPendingByAddress") || !pendingRepo.includes("issuePending")) {
  fail("validate-risk: pendingRewardRepo must include listPendingByAddress and issuePending");
}
const antiRepo = read("src/server/repo/antiCheatRepo.ts");
if (!antiRepo.includes("getReviewById")) {
  fail("validate-risk: antiCheatRepo must include getReviewById");
}
const adminRiskPage = read("app/admin/risk/page.tsx");
if (!adminRiskPage.includes("resolveAndIssue")) {
  fail("validate-risk: admin risk page must reference resolveAndIssue API");
}
if (!exists("src/server/repo/riskOpsRepo.ts")) fail("validate-risk: missing riskOpsRepo.ts");
const ops = read("src/server/repo/riskOpsRepo.ts");
if (!ops.includes("resolveReviewAndProcessPending")) fail("validate-risk: missing resolveReviewAndProcessPending");
ok("validate-risk passed: anti-cheat tables/repo/apis/admin pages present (Neon + four states).");
