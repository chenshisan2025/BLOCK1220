import { NextResponse } from "next/server";
import { z } from "zod";
import { antiCheatRepoPg } from "../../../../../src/server/repo/antiCheatRepo";

const q = z.object({ address: z.string().min(3) });

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = q.safeParse({ address: url.searchParams.get("address") || "" });
  if (!parsed.success) return NextResponse.json({ code: "BAD_REQUEST", message: "address required" }, { status: 400 });
  try {
    const repo = antiCheatRepoPg();
    const row = await repo.getAddress(parsed.data.address);
    return NextResponse.json({ address: parsed.data.address, profile: row });
  } catch (e: any) {
    return NextResponse.json({ code: "SERVER_ERROR", message: e?.message || "error" }, { status: 500 });
  }
}
