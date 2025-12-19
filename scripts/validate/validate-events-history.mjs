import { exists, read, fail, ok } from "./_util.mjs";

const required = [
  "src/server/repo/eventHistoryRepo.ts",
  "app/api/events/timeline/route.ts",
  "app/api/events/history/route.ts",
  "app/api/admin/events/timeline/route.ts",
  "app/api/admin/events/detail/route.ts",
];
for (const f of required) if (!exists(f)) fail(`validate-events-history: missing ${f}`);

const repo = read("src/server/repo/eventHistoryRepo.ts");
if (!repo.includes("listTimeline") || !repo.includes("listUserHistory")) {
  fail("validate-events-history: repo must implement listTimeline/listUserHistory");
}
if (!repo.includes("issued_rewards") || !repo.includes("event_completions")) {
  fail("validate-events-history: history must be based on event_completions + issued_rewards");
}

const pages = ["app/zh/events/page.tsx", "app/en/events/page.tsx"];
for (const p of pages) {
  if (!exists(p)) continue;
  const s = read(p);
  if (!s.includes("/api/events/timeline")) {
    fail(`validate-events-history: ${p} must call /api/events/timeline`);
  }
  const forbid = ["INSERT INTO", "requiredCount", "requiredRuns", "targetType ===", "specialType ==="];
  for (const tok of forbid) {
    if (s.includes(tok)) fail(`validate-events-history: UI must not implement rules or persistence (${tok}) in ${p}`);
  }
}
ok("validate-events-history passed: timeline/history APIs + repo present, pages wired, history based on completions+issued_rewards.");
