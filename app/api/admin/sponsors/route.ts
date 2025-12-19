import { NextResponse } from "next/server";
import sponsors from "../../../../src/content/sponsor/sponsors_v1.json";

export async function GET() {
  return NextResponse.json({ sponsors: (sponsors as any).sponsors || [] });
}
