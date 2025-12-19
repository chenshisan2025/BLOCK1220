const fs = require("fs");
const path = require("path");

const projectRoot = process.cwd();

function exists(p) {
  return fs.existsSync(path.join(projectRoot, p));
}

function read(p) {
  return fs.readFileSync(path.join(projectRoot, p), "utf8");
}

function scanFiles(globs) {
  const results = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else results.push(full);
    }
  }
  for (const g of globs) {
    const base = path.join(projectRoot, g);
    if (fs.existsSync(base)) {
      const stat = fs.statSync(base);
      if (stat.isDirectory()) walk(base);
      else results.push(base);
    }
  }
  return results;
}

function fail(msg) {
  console.error(msg);
  process.exitCode = 1;
}

function pass(msg) {
  console.log(msg);
}

function main() {
  let ok = true;

  if (!exists("src/design/tokens.ts")) {
    fail("缺少文件：src/design/tokens.ts");
    ok = false;
  } else {
    pass("存在文件：src/design/tokens.ts");
  }

  if (!exists("src/design/tailwind-neon-rules.ts")) {
    fail("缺少文件：src/design/tailwind-neon-rules.ts");
    ok = false;
  } else {
    pass("存在文件：src/design/tailwind-neon-rules.ts");
  }

  const hasNeonCard = exists("src/components/NeonCard.tsx");
  const hasNeonButton = exists("src/components/NeonButton.tsx");
  if (!hasNeonCard && !hasNeonButton) {
    fail("缺少组件：NeonCard 或 NeonButton 至少其一");
    ok = false;
  } else {
    pass("存在组件：Neon 组件");
  }

  const pageTsxPath = "app/page.tsx";
  if (!exists(pageTsxPath)) {
    fail("缺少默认页面：app/page.tsx");
    ok = false;
  } else {
    const content = read(pageTsxPath);
    const usesNeon =
      content.includes("NeonCard") || content.includes("NeonButton");
    if (!usesNeon) {
      fail("默认页面未使用 NeonCard/NeonButton");
      ok = false;
    }
    const states = ["Loading", "Empty", "Error", "Degraded"];
    for (const s of states) {
      if (!content.toLowerCase().includes(s.toLowerCase())) {
        fail(`默认页面缺少 UI 状态：${s}`);
        ok = false;
      }
    }
    pass("默认页面包含 UI 状态与 Neon 组件");
  }

  const filesToCheck = scanFiles(["app", "src/components"]);
  const hexRe = /#[0-9a-fA-F]{3,6}/g;
  for (const f of filesToCheck) {
    if (f.endsWith(".tsx") || f.endsWith(".ts") || f.endsWith(".jsx")) {
      const c = fs.readFileSync(f, "utf8");
      if (hexRe.test(c)) {
        fail(`检测到组件/页面中直接使用十六进制颜色：${path.relative(projectRoot, f)}`);
        ok = false;
      }
    }
  }
  pass("组件/页面未直接使用十六进制颜色");

  if (ok) {
    console.log("Validation Result: PASS");
    process.exit(0);
  } else {
    console.log("Validation Result: FAIL");
    process.exit(1);
  }
}

main();
