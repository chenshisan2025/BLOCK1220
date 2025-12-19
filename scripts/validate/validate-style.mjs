import { walk, read, logPass, logFail } from "./_util.mjs";

let ok = true;

const files = [
  ...walk("app", (f) => f.endsWith(".ts") || f.endsWith(".tsx") || f.endsWith(".jsx")),
  ...walk("src/components", (f) => f.endsWith(".ts") || f.endsWith(".tsx") || f.endsWith(".jsx")),
];

const hexRe = /#[0-9a-fA-F]{3,6}\b/g;
for (const f of files) {
  if (f.includes("src/design/tokens.ts")) continue;
  const c = read(f);
  if (hexRe.test(c)) {
    logFail(`检测到组件/页面中直接使用十六进制颜色：${f}`);
    ok = false;
  }
}

if (ok) {
  logPass("组件/页面未直接使用十六进制颜色");
} else {
  process.exit(1);
}
