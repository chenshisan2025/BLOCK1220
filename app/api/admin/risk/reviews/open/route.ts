import { NextResponse } from "next/server";
import { antiCheatRepoPg } from "../../../../../../src/server/repo/antiCheatRepo";

export async function GET() {
  try {
    const repo = antiCheatRepoPg();
    const rows = await repo.listOpenReviews(200);
    return NextResponse.json({ reviews: rows });
  } catch (e: any) {
    return NextResponse.json({ code: "SERVER_ERROR", message: e?.message || "error" }, { status: 500 });
  }
}
