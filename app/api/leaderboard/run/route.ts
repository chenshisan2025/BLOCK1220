import { NextResponse } from "next/server";
import { z } from "zod";
import { submitRun } from "../../../../src/server/leaderboard/store";
import { migratePg } from "../../../../src/server/db/migratePg";
import { evaluateRisk } from "../../../../src/server/risk/riskModel";
import { antiCheatRepoPg } from "../../../../src/server/repo/antiCheatRepo";

const telemetrySchema = z
  .object({
    revivesUsed: z.number().optional(),
    swapsTotal: z.number().optional(),
    swapsValid: z.number().optional(),
    cascadesTotal: z.number().optional(),
    specialsTotal: z.number().optional(),
    specialsLine: z.number().optional(),
    specialsBomb: z.number().optional(),
    specialsColor: z.number().optional(),
  })
  .optional();

const runSchema = z.object({
  mode: z.literal("endless"),
  address: z.string(),
  rawScore: z.number(),
  effectiveTimeSec: z.number(),
  rankScore: z.number(),
  timestamp: z.number(),
  telemetry: telemetrySchema,
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
  const t = run.telemetry || {};
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
    revivesUsed: Number(t.revivesUsed ?? 0),
    swapsTotal: Number(t.swapsTotal ?? 0),
    swapsValid: Number(t.swapsValid ?? 0),
    cascadesTotal: Number(t.cascadesTotal ?? 0),
    specialsTotal: Number(t.specialsTotal ?? 0),
    specialsLine: Number(t.specialsLine ?? 0),
    specialsBomb: Number(t.specialsBomb ?? 0),
    specialsColor: Number(t.specialsColor ?? 0),
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
