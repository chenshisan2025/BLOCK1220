import { walk, logPass, logFail } from "./_util.mjs";

let ok = true;

const files = [
  ...walk("app"),
  ...walk("src"),
  ...walk("public"),
];

const banned = files.filter((f) => f.endsWith(".mp3") || f.endsWith(".wav"));
if (banned.length > 0) {
  logFail("检测到禁止的音频资源：mp3/wav");
  ok = false;
} else {
  logPass("未使用 mp3/wav，符合 Web Audio 约束");
}

if (!ok) process.exit(1);
