import { NextResponse } from "next/server";
import boxes from "../../../../src/content/sponsor/sponsor_boxes_v1.json";

export async function GET() {
  return NextResponse.json({ boxes: (boxes as any).boxes || [] });
}
