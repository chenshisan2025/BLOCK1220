import { NextResponse } from "next/server";
import { riskPolicyRepoPg } from "../../../../../../src/server/repo/riskPolicyRepo";

export async function GET() {
  try {
    const rows = await riskPolicyRepoPg().listAudit(20);
    return NextResponse.json({ audit: rows });
  } catch (e: any) {
    return NextResponse.json({ code: "SERVER_ERROR", message: e?.message || "error" }, { status: 500 });
  }
}
