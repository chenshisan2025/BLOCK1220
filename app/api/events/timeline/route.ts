import { NextResponse } from "next/server";
import { eventHistoryRepoPg } from "../../../../src/server/repo/eventHistoryRepo";

export async function GET() {
  try {
    const repo = eventHistoryRepoPg();
    const now = new Date();
    const data = await repo.listTimeline(now);
    const normalize = (rows: any[]) =>
      (rows || []).map((r: any) => ({
        eventId: r.event_id,
        titleKey: r.title_key,
        descKey: r.desc_key,
        type: r.type,
        rules: r.rules,
        reward: r.reward,
        startAt: r.start_at,
        endAt: r.end_at,
        status: r.status,
      }));
    return NextResponse.json({
      serverNow: Math.floor(Date.now() / 1000),
      active: normalize(data.active),
      upcoming: normalize(data.upcoming),
      ended: normalize(data.ended),
    });
  } catch (e: any) {
    return NextResponse.json({ code: "SERVER_ERROR", message: e?.message || "error" }, { status: 500 });
  }
}
