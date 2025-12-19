import { NextResponse } from "next/server";
import { z } from "zod";
import { submitRun } from "../../../../src/server/leaderboard/store";
import { migratePg } from "../../../../src/server/db/migratePg";
import { evaluateRisk } from "../../../../src/server/risk/riskModel";
import { antiCheatRepoPg } from "../../../../src/server/repo/antiCheatRepo";

const runSchema = z.object({
  mode: z.literal("endless"),
  address: z.string(),
  rawScore: z.number(),
  effectiveTimeSec: z.number(),
  rankScore: z.number(),
  timestamp: z.number(),
});

function getDay(ts: number) {
  const d = new Date(ts);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export async function POST(req: Request) {
  await migratePg();
  const body = await req.json().catch(() => null);
  const parsed = runSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ code: "BAD_REQUEST" }, { status: 400 });
  }
  const run = parsed.data;
  const repo = antiCheatRepoPg();
  const telemetry = {
    runId: `${run.address}:${run.timestamp}`,
    ts: run.timestamp,
    day: getDay(run.timestamp),
    mode: "endless" as const,
    levelId: null,
    address: run.address,
    rawScore: run.rawScore,
    effectiveTimeSec: run.effectiveTimeSec,
    rankScore: Math.floor(run.rankScore),
    revivesUsed: 0,
    swapsTotal: 0,
    swapsValid: 0,
    cascadesTotal: 0,
    specialsTotal: 0,
    specialsLine: 0,
    specialsBomb: 0,
    specialsColor: 0,
    bossType: null,
    bossFlags: {},
    clientMeta: {},
    serverMeta: {},
  };
  const risk = evaluateRisk(telemetry);
  await repo.recordRun(telemetry, risk);
  if (risk.decision === "review") await repo.enqueueReview(telemetry.runId, telemetry.address);
  if (risk.decision === "allow") {
    await submitRun({
      address: run.address,
      rawScore: run.rawScore,
      effectiveTimeSec: run.effectiveTimeSec,
      rankScore: Math.floor(run.rankScore),
      ts: run.timestamp,
    });
    return NextResponse.json({ ok: true, decision: "allow" });
  }
  return NextResponse.json({ ok: true, decision: risk.decision, note: "Recorded and gated by risk policy" });
}
