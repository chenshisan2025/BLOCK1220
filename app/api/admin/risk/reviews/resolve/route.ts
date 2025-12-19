import { NextResponse } from "next/server";
import { z } from "zod";
import { antiCheatRepoPg } from "../../../../../../src/server/repo/antiCheatRepo";

const bodySchema = z.object({
  id: z.number().int().positive(),
  resolution: z.enum(["legit", "cheat", "unknown"]),
  reviewer: z.string().min(1),
  note: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ code: "BAD_REQUEST", message: "invalid body" }, { status: 400 });
  try {
    const repo = antiCheatRepoPg();
    await repo.resolveReview(parsed.data.id, parsed.data.resolution, parsed.data.reviewer, parsed.data.note);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ code: "SERVER_ERROR", message: e?.message || "error" }, { status: 500 });
  }
}
