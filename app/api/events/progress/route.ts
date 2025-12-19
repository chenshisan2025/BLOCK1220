import { NextResponse } from "next/server";
import { z } from "zod";
import { getPg } from "../../../../src/server/db/pg";
import { migratePg } from "../../../../src/server/db/migratePg";
import { listActiveEventCampaigns } from "../../../../src/server/repo/eventConfigRepo";

const q = z.object({ address: z.string().min(3) });

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = q.safeParse({ address: url.searchParams.get("address") || "" });
  if (!parsed.success) return NextResponse.json({ code: "BAD_REQUEST", message: "address required" }, { status: 400 });
  await migratePg();
  const sql = getPg();
  const now = Date.now();
  const active = await listActiveEventCampaigns(new Date(now));
  const rows = await sql`
    SELECT event_id, current, required, updated_at
    FROM event_progress
    WHERE address = ${parsed.data.address}
  `;
  const map = new Map(rows.map((r: any) => [r.event_id, r]));
  const progress = (active as any[]).map((c: any) => {
    const row = map.get(c.eventId);
    const required =
      c.type === "CollectEvent" ? c.rules.requiredCount : c.type === "ClearSpecialEvent" ? c.rules.requiredCount : c.rules.requiredRuns;
    const current = row ? Number(row.current) : 0;
    const completed = current >= required;
    return {
      eventId: c.eventId,
      current,
      required,
      completed,
      updatedAt: row ? Number(row.updated_at) : null,
      titleKey: (c as any).titleKey,
      descKey: (c as any).descKey,
      type: c.type,
    };
  });
  return NextResponse.json({ serverNow: Math.floor(now / 1000), progress });
}
