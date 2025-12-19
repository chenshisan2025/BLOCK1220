import { NextResponse } from "next/server";
import zh from "../../../../src/mocks/api_status_summary.zh.json";
import en from "../../../../src/mocks/api_status_summary.en.json";
import { statusSchema } from "../../../../src/lib/validators/status";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get("lang") === "en" ? "en" : "zh";
  const data = lang === "zh" ? zh : en;
  const parsed = statusSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ code: "INVALID_RESPONSE", message: "Schema validation failed" }, { status: 500 });
  }
  return NextResponse.json(parsed.data);
}
