import { NextResponse } from "next/server";
import { z } from "zod";
import { riskPolicyRepoPg } from "../../../../../src/server/repo/riskPolicyRepo";

export async function GET() {
  try {
    const repo = riskPolicyRepoPg();
    await repo.seedIfMissing("system");
    const p = await repo.getActive();
    if (!p) return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
    return NextResponse.json({ policyId: p.policyId, version: p.version, config: p.config, updatedBy: p.updatedBy, updatedTs: p.updatedTs });
  } catch (e: any) {
    return NextResponse.json({ code: "SERVER_ERROR", message: e?.message || "error" }, { status: 500 });
  }
}

const bodySchema = z.object({ config: z.any(), actor: z.string().min(1), note: z.string().optional() });
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ code: "BAD_REQUEST" }, { status: 400 });
  try {
    const repo = riskPolicyRepoPg();
    const out = await repo.update(parsed.data.config, parsed.data.actor, parsed.data.note);
    return NextResponse.json({ ok: true, version: out.version });
  } catch (e: any) {
    return NextResponse.json({ code: "SERVER_ERROR", message: e?.message || "error" }, { status: 500 });
  }
}
