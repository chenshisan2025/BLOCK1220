import { NextResponse } from "next/server";
import { z } from "zod";
import { riskOpsRepoPg } from "../../../../../../src/server/repo/riskOpsRepo";

const bodySchema = z.object({
  reviewId: z.number().int().positive(),
  resolution: z.enum(["legit", "cheat", "unknown"]),
  reviewer: z.string().min(1),
  note: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ code: "BAD_REQUEST", message: "invalid body" }, { status: 400 });
  try {
    const out = await riskOpsRepoPg().resolveReviewAndProcessPending({
      reviewId: parsed.data.reviewId,
      resolution: parsed.data.resolution,
      reviewer: parsed.data.reviewer,
      note: parsed.data.note,
    });
    return NextResponse.json(out);
  } catch (e: any) {
    return NextResponse.json({ code: "SERVER_ERROR", message: e?.message || "error" }, { status: 500 });
  }
}
