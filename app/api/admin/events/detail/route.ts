import { NextResponse } from "next/server";
import { z } from "zod";
import { eventHistoryRepoPg } from "../../../../../src/server/repo/eventHistoryRepo";

const q = z.object({ eventId: z.string().min(3) });

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = q.safeParse({ eventId: url.searchParams.get("eventId") || "" });
  if (!parsed.success) return NextResponse.json({ code: "BAD_REQUEST", message: "eventId required" }, { status: 400 });
  try {
    const repo = eventHistoryRepoPg();
    const detail = await repo.getAdminEventDetail(parsed.data.eventId, 7);
    return NextResponse.json(detail);
  } catch (e: any) {
    return NextResponse.json({ code: "SERVER_ERROR", message: e?.message || "error" }, { status: 500 });
  }
}
