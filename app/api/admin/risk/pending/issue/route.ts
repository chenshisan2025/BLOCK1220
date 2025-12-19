import { NextResponse } from "next/server";
import { z } from "zod";
import { pendingRewardRepoPg } from "../../../../../../src/server/repo/pendingRewardRepo";

const bodySchema = z.object({ pendingId: z.number().int().positive(), reviewer: z.string().min(1), note: z.string().optional() });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ code: "BAD_REQUEST", message: "invalid body" }, { status: 400 });
  const repo = pendingRewardRepoPg();
  const out = await repo.issuePending(parsed.data.pendingId, parsed.data.reviewer, parsed.data.note);
  return NextResponse.json(out, { status: out.ok ? 200 : 400 });
}
