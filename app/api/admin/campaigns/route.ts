import { NextResponse } from "next/server";
import campaigns from "../../../../src/content/sponsor/sponsor_campaigns_v1.json";

export async function GET() {
  return NextResponse.json({ campaigns: (campaigns as any).campaigns || [] });
}
