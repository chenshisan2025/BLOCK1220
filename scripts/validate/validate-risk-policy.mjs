import { exists, read, fail, ok } from "./_util.mjs";

const migrate = read("src/server/db/pg_migrate.sql");
if (!migrate.includes("CREATE TABLE IF NOT EXISTS risk_policies") || !migrate.includes("CREATE TABLE IF NOT EXISTS risk_policy_audit")) {
  fail("validate-risk-policy: pg_migrate.sql must include risk_policies and risk_policy_audit");
}
if (!exists("src/server/repo/riskPolicyRepo.ts")) fail("validate-risk-policy: missing riskPolicyRepo.ts");
const repo = read("src/server/repo/riskPolicyRepo.ts");
for (const tok of ["seedIfMissing", "getActive", "update", "listAudit", "getDefaultRiskConfig"]) {
  if (!repo.includes(tok)) fail(`validate-risk-policy: riskPolicyRepo must include ${tok}`);
}
if (!exists("src/server/risk/riskModel.ts")) fail("validate-risk-policy: missing riskModel.ts");
const model = read("src/server/risk/riskModel.ts");
if (!model.includes("evaluateRisk(") || !model.includes("(t: Telemetry, cfg")) {
  fail("validate-risk-policy: evaluateRisk must accept cfg parameter");
}
const bannedPatterns = [
  />\s*20000/,
  />\s*2\.2/,
  />\s*0\.98/,
  />\s*0\.35/,
  />=\s*6/,
  />=\s*40/,
  />=\s*70/,
  />=\s*85/,
];
for (const re of bannedPatterns) {
  const r = new RegExp(re.source);
  if (r.test(model)) {
    fail(`validate-risk-policy: riskModel must not hardcode threshold pattern ${re.source}`);
  }
}
const runApi = read("app/api/leaderboard/run/route.ts");
if (!runApi.includes("riskPolicyRepoPg") || !runApi.includes("seedIfMissing") || !runApi.includes("getActive") || !runApi.includes("evaluateRisk(telemetry")) {
  fail("validate-risk-policy: leaderboard/run must load policy and evaluate with cfg");
}
if (!exists("app/api/admin/risk/policy/route.ts") || !exists("app/api/admin/risk/policy/audit/route.ts")) {
  fail("validate-risk-policy: missing admin policy routes");
}
if (!exists("app/admin/risk/policy/page.tsx")) fail("validate-risk-policy: missing admin policy page");
ok("validate-risk-policy passed: DB-first risk policy + admin editor + audit wired.");
