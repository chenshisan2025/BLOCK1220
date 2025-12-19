import { exists, logPass, logFail } from "./_util.mjs";

let ok = true;

if (exists("pages")) {
  logFail("检测到 pages 目录，必须使用 App Router");
  ok = false;
} else {
  logPass("未使用 pages，符合 App Router 要求");
}

if (!exists("app/layout.tsx")) {
  logFail("缺少 app/layout.tsx");
  ok = false;
} else {
  logPass("存在 app/layout.tsx");
}

if (!ok) process.exit(1);
