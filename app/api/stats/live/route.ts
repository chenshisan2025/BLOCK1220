import { NextResponse } from "next/server";
import zh from "../../../../src/mocks/api_stats_live.zh.json";
import en from "../../../../src/mocks/api_stats_live.en.json";
import { liveStatsSchema } from "../../../../src/lib/validators/liveStats";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get("lang") === "en" ? "en" : "zh";
  const data = lang === "zh" ? zh : en;
  const parsed = liveStatsSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ code: "INVALID_RESPONSE", message: "Schema validation failed" }, { status: 500 });
  }
  return NextResponse.json(parsed.data);
}
