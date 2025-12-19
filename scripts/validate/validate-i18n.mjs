import { exists, logPass, logFail, read } from "./_util.mjs";

let ok = true;

const pkg = JSON.parse(read("package.json"));
const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
if (deps["next-intl"]) {
  logPass("已接入 next-intl 依赖");
} else {
  logFail("未接入 next-intl 依赖");
  ok = false;
}

const hasZh = exists("messages/zh.json");
const hasEn = exists("messages/en.json");
if (hasZh && hasEn) {
  logPass("存在 messages/zh.json 与 messages/en.json");
} else {
  logFail("缺少 messages/zh.json 或 messages/en.json");
  ok = false;
}

if (!ok) process.exit(1);
