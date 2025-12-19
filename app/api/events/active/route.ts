import { NextResponse } from "next/server";
import { listActiveEventCampaigns } from "../../../../src/server/repo/eventConfigRepo";

export async function GET() {
  try {
    const now = new Date();
    const active = await listActiveEventCampaigns(now);
    return NextResponse.json({ serverNow: Math.floor(now.getTime() / 1000), active });
  } catch (e: any) {
    return NextResponse.json({ code: "SERVER_ERROR", message: e?.message || "error" }, { status: 500 });
  }
}
