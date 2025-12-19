import { exists, read, fail, ok } from "./_util.mjs";

function assertFile(p) {
  if (!exists(p)) fail(`validate-admin-config: missing file ${p}`);
}
function assertContains(p, token) {
  if (!exists(p)) fail(`validate-admin-config: missing file ${p}`);
  const s = read(p);
  if (!s.includes(token)) fail(`validate-admin-config: ${p} must contain token '${token}'`);
}
function failIfContains(p, token) {
  if (!exists(p)) return;
  const s = read(p);
  if (s.includes(token)) fail(`validate-admin-config: forbidden token '${token}' found in ${p}`);
}

// 1. DB table exists in migration
const migrate = read("src/server/db/pg_migrate.sql");
if (!migrate.includes("CREATE TABLE IF NOT EXISTS event_campaigns")) {
  fail("validate-admin-config: pg_migrate.sql must define event_campaigns table");
}

// 2. Admin page exists
assertFile("app/admin/events/page.tsx");

// 3. API uses DB repo
assertContains("app/api/events/active/route.ts", "eventConfigRepo");

// 4. forbid JSON fallback
failIfContains("app/api/events/active/route.ts", "event_campaigns_v1.json");
failIfContains("app/api/events/progress/route.ts", "event_campaigns_v1.json");
failIfContains("app/api/events/claim/route.ts", "event_campaigns_v1.json");

// 5. Admin must not write issued_rewards
failIfContains("app/admin/events/page.tsx", "issued_rewards");

ok("validate-admin-config passed: DB-first event campaigns, admin page present, APIs use eventConfigRepo, no JSON fallback.");
