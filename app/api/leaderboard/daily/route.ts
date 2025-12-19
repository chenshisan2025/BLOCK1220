import { NextResponse } from "next/server";
import { getDaily, ensureSettlement } from "../../../../src/server/leaderboard/store";
import { migratePg } from "../../../../src/server/db/migratePg";
import { ttlCache } from "../../../../src/server/cache/ttlCache";

export async function GET(req: Request) {
  await migratePg();
  const { searchParams } = new URL(req.url);
  const day = searchParams.get("day") || "today";
  const cacheKey = `leaderboard:daily:${day}`;
  const data = await ttlCache.wrap(cacheKey, 30_000, async () => {
    const daily = await getDaily(day === "today" ? undefined : day);
    const root = await ensureSettlement(day === "today" ? undefined : day);
    return { ...daily, settlement: root };
  });
  const { entries } = data;
  return NextResponse.json(data);
}

function getToday() {
  const now = Date.now();
  const d = new Date(now);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}
