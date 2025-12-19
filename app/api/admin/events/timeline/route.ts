import { NextResponse } from "next/server";
import { eventHistoryRepoPg } from "../../../../../src/server/repo/eventHistoryRepo";
import { ttlCache } from "../../../../../src/server/cache/ttlCache";

export async function GET() {
  try {
    const data = await ttlCache.wrap("admin:events_timeline", 30_000, async () => {
      const repo = eventHistoryRepoPg();
      return await repo.getAdminTimeline(new Date());
    });
    return NextResponse.json({ events: data });
  } catch (e: any) {
    return NextResponse.json({ code: "SERVER_ERROR", message: e?.message || "error" }, { status: 500 });
  }
}
