import { exists, read, logPass, logFail } from "./_util.mjs";

let ok = true;

if (!exists("app/page.tsx")) {
  logFail("缺少默认页面：app/page.tsx");
  ok = false;
} else {
  const c = read("app/page.tsx");
  const usesNeon = c.includes("NeonCard") || c.includes("NeonButton");
  if (!usesNeon) {
    logFail("默认页面未使用 NeonCard/NeonButton");
    ok = false;
  } else {
    logPass("默认页面使用 Neon 组件");
  }
  const states = ["Loading", "Empty", "Error", "Degraded"];
  for (const s of states) {
    if (!c.includes(s)) {
      logFail(`默认页面缺少 UI 状态：${s}`);
      ok = false;
    }
  }
  if (ok) logPass("默认页面包含 Loading/Empty/Error/Degraded");
}

if (!ok) process.exit(1);
