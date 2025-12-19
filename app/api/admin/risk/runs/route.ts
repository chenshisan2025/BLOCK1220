import { NextResponse } from "next/server";
import { z } from "zod";
import { antiCheatRepoPg } from "../../../../../src/server/repo/antiCheatRepo";

const q = z.object({ day: z.string(), min: z.coerce.number().int().min(0).max(100).optional() });

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = q.safeParse({ day: url.searchParams.get("day") || "", min: url.searchParams.get("min") || undefined });
  if (!parsed.success) return NextResponse.json({ code: "BAD_REQUEST", message: "day required" }, { status: 400 });
  try {
    const repo = antiCheatRepoPg();
    const rows = await repo.listRuns(parsed.data.day, parsed.data.min ?? 40);
    return NextResponse.json({ day: parsed.data.day, min: parsed.data.min ?? 40, runs: rows });
  } catch (e: any) {
    return NextResponse.json({ code: "SERVER_ERROR", message: e?.message || "error" }, { status: 500 });
  }
}
