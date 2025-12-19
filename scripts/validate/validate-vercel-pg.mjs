import { exists, read, fail, ok } from "./_util.mjs";

/**
 * validate-vercel-pg
 * Ensures Vercel-safe persistence:
 * - No SQLite/better-sqlite3/.data sqlite usage
 * - PG layer files exist
 * - Repos reference DATABASE_URL
 * - APIs use PG repos/migratePg
 */

const forbiddenTokens = ["better-sqlite3", ".data/blockworld.sqlite", ".data/", "new Database(", "sqlite"];

const requiredFiles = ["src/server/db/pg.ts", "src/server/db/migratePg.ts", "src/server/db/pg_migrate.sql"];
for (const f of requiredFiles) {
  if (!exists(f)) fail(`validate-vercel-pg: missing required file ${f}`);
}

const pgTs = read("src/server/db/pg.ts");
if (!pgTs.includes("DATABASE_URL")) {
  fail("validate-vercel-pg: pg.ts must read DATABASE_URL");
}

const migrateTs = read("src/server/db/migratePg.ts");
if (!migrateTs.includes("pg_migrate.sql")) {
  fail("validate-vercel-pg: migratePg.ts must load pg_migrate.sql");
}

const filesToCheck = [
  "src/server/repo/sponsorRepo.ts",
  "src/server/repo/claimRepo.ts",
  "src/server/leaderboard/store.ts",
  "app/api/sponsor/openBox/route.ts",
  "app/api/sponsor/completeCampaign/route.ts",
  "app/api/claimables/route.ts",
  "app/api/admin/sponsor-analytics/summary/route.ts",
  "app/api/leaderboard/run/route.ts",
  "app/api/leaderboard/daily/route.ts",
];

for (const f of filesToCheck) {
  if (!exists(f)) continue;
  const s = read(f);
  for (const tok of forbiddenTokens) {
    if (s.includes(tok)) {
      fail(`validate-vercel-pg: forbidden sqlite token '${tok}' found in ${f}`);
    }
  }
}

const repoFiles = ["src/server/repo/sponsorRepo.ts", "src/server/repo/claimRepo.ts", "src/server/leaderboard/store.ts"];
for (const f of repoFiles) {
  if (!exists(f)) continue;
  const s = read(f);
  const hasPgSignal = s.includes("getPg") || s.includes("postgres(") || s.includes("migratePg");
  if (!hasPgSignal) {
    fail(`validate-vercel-pg: repo must use PG client/migratePg: ${f}`);
  }
}

const apiFiles = [
  "app/api/sponsor/openBox/route.ts",
  "app/api/sponsor/completeCampaign/route.ts",
  "app/api/claimables/route.ts",
  "app/api/admin/sponsor-analytics/summary/route.ts",
  "app/api/leaderboard/run/route.ts",
  "app/api/leaderboard/daily/route.ts",
];
for (const f of apiFiles) {
  if (!exists(f)) continue;
  const s = read(f);
  const hasSignal = s.includes("migratePg") || s.includes("RepoPg") || s.includes("getPg");
  if (!hasSignal) {
    fail(`validate-vercel-pg: API must call PG repo/migratePg: ${f}`);
  }
}

ok("validate-vercel-pg passed: no sqlite usage, PG layer exists, repos/APIs use DATABASE_URL-backed Postgres.");
