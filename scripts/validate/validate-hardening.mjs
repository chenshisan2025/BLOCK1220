import { exists, read, fail, ok } from "./_util.mjs";

const mustFiles = ["middleware.ts", "src/server/cache/ttlCache.ts", "scripts/validate/validate-vercel-pg.mjs"];
for (const f of mustFiles) {
  if (!exists(f)) fail(`validate-hardening: missing ${f}`);
}
const middleware = read("middleware.ts");
if (!middleware.includes("matcher") || !middleware.includes("/admin") || !middleware.includes("/api/admin")) {
  fail("validate-hardening: middleware must protect /admin and /api/admin via matcher");
}
if (!middleware.includes("x-admin-key") && !middleware.includes("admin_key")) {
  fail("validate-hardening: middleware must check x-admin-key header or admin_key cookie");
}
const cache = read("src/server/cache/ttlCache.ts");
if (!cache.includes("wrap(") || !cache.includes("ttlCache")) {
  fail("validate-hardening: ttlCache must implement wrap() and export singleton");
}
const adminSummaryPath = "app/api/admin/sponsor-analytics/summary/route.ts";
const lbDailyPath = "app/api/leaderboard/daily/route.ts";
if (!exists(adminSummaryPath) || !exists(lbDailyPath)) {
  fail("validate-hardening: required API routes missing for hardening checks");
}
const adminSummary = read(adminSummaryPath);
if (!adminSummary.includes("ttlCache.wrap") || !adminSummary.includes("30_000")) {
  fail("validate-hardening: sponsor analytics summary must use ttlCache.wrap with ~30s TTL");
}
const lbDaily = read(lbDailyPath);
if (!lbDaily.includes("ttlCache.wrap") || !lbDaily.includes("30_000")) {
  fail("validate-hardening: leaderboard daily must use ttlCache.wrap with ~30s TTL");
}
ok("validate-hardening passed: admin auth middleware + ttl cache enforced for critical APIs.");
