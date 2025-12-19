import { exists, logPass, logFail } from "./_util.mjs";

let ok = true;

if (!exists("src/design/tokens.ts")) {
  logFail("缺少文件：src/design/tokens.ts");
  ok = false;
} else {
  logPass("存在文件：src/design/tokens.ts");
}

if (!exists("src/design/tailwind-neon-rules.ts")) {
  logFail("缺少文件：src/design/tailwind-neon-rules.ts");
  ok = false;
} else {
  logPass("存在文件：src/design/tailwind-neon-rules.ts");
}

const hasCardUI = exists("src/components/ui/NeonCard.tsx");
const hasBtnUI = exists("src/components/ui/NeonButton.tsx");
if (!hasCardUI || !hasBtnUI) {
  logFail("Neon 组件未在 src/components/ui/ 统一存在");
  ok = false;
} else {
  logPass("Neon 组件路径统一：src/components/ui/");
}

if (exists("src/components/NeonCard.tsx") || exists("src/components/NeonButton.tsx")) {
  logFail("检测到旧路径 Neon 组件，需移除 src/components 下的重复组件");
  ok = false;
} else {
  logPass("未发现旧路径 Neon 组件");
}

if (!exists("app/layout.tsx") || !exists("app/page.tsx")) {
  logFail("缺少 App Router 必要文件：app/layout.tsx 或 app/page.tsx");
  ok = false;
} else {
  logPass("存在 App Router 基础文件");
}

if (!ok) process.exit(1);
