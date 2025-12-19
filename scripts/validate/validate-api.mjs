import { exists, logPass, logFail } from "./_util.mjs";

let ok = true;

const routes = [
  "app/api/stats/live/route.ts",
  "app/api/claimables/route.ts",
  "app/api/status/summary/route.ts",
];
const mocks = [
  "src/mocks/api_stats_live.zh.json",
  "src/mocks/api_stats_live.en.json",
  "src/mocks/api_claimables.zh.json",
  "src/mocks/api_claimables.en.json",
  "src/mocks/api_status_summary.zh.json",
  "src/mocks/api_status_summary.en.json",
];
const schemas = [
  "src/lib/validators/liveStats.ts",
  "src/lib/validators/claimables.ts",
  "src/lib/validators/status.ts",
];

let routesOk = routes.every(exists);
let mocksOk = mocks.every(exists);
let schemasOk = schemas.every(exists);

if (routesOk) logPass("API 路由存在");
else {
  logFail("缺少 API 路由文件");
  ok = false;
}
if (mocksOk) logPass("Mock 文件存在");
else {
  logFail("缺少 Mock 文件");
  ok = false;
}
if (schemasOk) logPass("Schema 文件存在");
else {
  logFail("缺少 Schema 文件");
  ok = false;
}

if (!ok) process.exit(1);
