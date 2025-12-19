import { NextResponse } from "next/server";
import { z } from "zod";
import { eventConfigRepoPg } from "../../../../src/server/repo/eventConfigRepo";

export async function GET() {
  try {
    const repo = eventConfigRepoPg();
    const rows = await repo.listAll();
    return NextResponse.json({ events: rows });
  } catch (e: any) {
    return NextResponse.json({ code: "SERVER_ERROR", message: e?.message || "error" }, { status: 500 });
  }
}

const upsertSchema = z.object({
  eventId: z.string().min(3),
  titleKey: z.string().min(3),
  descKey: z.string().min(3),
  type: z.enum(["CollectEvent", "ClearSpecialEvent", "PlayStreakEvent"]),
  rules: z.any(),
  reward: z.any(),
  startAt: z.string(),
  endAt: z.string(),
  status: z.enum(["active", "inactive"]),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = upsertSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ code: "BAD_REQUEST", message: "invalid event config" }, { status: 400 });
    }
    const repo = eventConfigRepoPg();
    await repo.upsert(parsed.data);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ code: "SERVER_ERROR", message: e?.message || "error" }, { status: 500 });
  }
}
