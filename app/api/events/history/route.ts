import { NextResponse } from "next/server";
import { z } from "zod";
import { eventHistoryRepoPg } from "../../../../src/server/repo/eventHistoryRepo";

const q = z.object({ address: z.string().min(3) });

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = q.safeParse({ address: url.searchParams.get("address") || "" });
  if (!parsed.success) {
    return NextResponse.json({ code: "BAD_REQUEST", message: "address required" }, { status: 400 });
  }
  try {
    const repo = eventHistoryRepoPg();
    const items = await repo.listUserHistory(parsed.data.address);
    return NextResponse.json({ serverNow: Math.floor(Date.now() / 1000), items });
  } catch (e: any) {
    return NextResponse.json({ code: "SERVER_ERROR", message: e?.message || "error" }, { status: 500 });
  }
}
