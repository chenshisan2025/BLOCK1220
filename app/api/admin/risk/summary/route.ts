import { NextResponse } from "next/server";
import { z } from "zod";
import { antiCheatRepoPg } from "../../../../../src/server/repo/antiCheatRepo";

const q = z.object({ day: z.string().optional() });

function dayIdUtc8(ts = Date.now()) {
  const d = new Date(ts + 8 * 3600 * 1000);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const parsed = q.safeParse({ day: url.searchParams.get("day") || undefined });
    if (!parsed.success) return NextResponse.json({ code: "BAD_REQUEST", message: "invalid query" }, { status: 400 });
    const day = parsed.data.day || dayIdUtc8();
    const repo = antiCheatRepoPg();
    const rows = await repo.summary(day);
    const counts: Record<string, number> = { allow: 0, shadow: 0, review: 0, deny: 0 };
    for (const r of rows as any[]) counts[String(r.decision)] = Number(r.n);
    const open = await repo.listOpenReviews(50);
    return NextResponse.json({ day, counts, openReviews: open });
  } catch (e: any) {
    return NextResponse.json({ code: "SERVER_ERROR", message: e?.message || "error" }, { status: 500 });
  }
}
