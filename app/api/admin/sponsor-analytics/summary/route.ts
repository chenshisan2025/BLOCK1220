import { NextResponse } from "next/server";
import { sponsorRepoPg } from "../../../../../src/server/repo/sponsorRepo";
import { migratePg } from "../../../../../src/server/db/migratePg";
import { ttlCache } from "../../../../../src/server/cache/ttlCache";

export async function GET() {
  await migratePg();
  const data = await ttlCache.wrap("admin:sponsor_summary:7d", 30_000, async () => {
    const repo = sponsorRepoPg();
    return await repo.getSummary(7);
  });
  return NextResponse.json(data);
}
