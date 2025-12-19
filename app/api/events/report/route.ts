import { NextResponse } from "next/server";
import { z } from "zod";
import { listActiveEventCampaigns } from "../../../../src/server/repo/eventConfigRepo";
import { eventRepoPg } from "../../../../src/server/repo/eventRepo";
import { migratePg } from "../../../../src/server/db/migratePg";

const bodySchema = z.object({
  address: z.string().min(3),
  mode: z.enum(["story", "endless"]),
  signals: z.object({
    collected: z.record(z.string(), z.number().int().nonnegative()).optional(),
    specialConsumed: z.record(z.enum(["Line", "Bomb", "Color"]), z.number().int().nonnegative()).optional(),
    runCompleted: z.object({ count: z.number().int().nonnegative() }).optional(),
  }),
});

function requiredForCampaign(c: any): number {
  if (c.type === "CollectEvent") return c.rules.requiredCount;
  if (c.type === "ClearSpecialEvent") return c.rules.requiredCount;
  return c.rules.requiredRuns;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ code: "BAD_REQUEST", message: "invalid body" }, { status: 400 });
  try {
    await migratePg();
    const { address, mode, signals } = parsed.data;
    const now = Date.now();
    const active = await listActiveEventCampaigns(new Date(now));
    const repo = eventRepoPg();
    const updates: any[] = [];
    for (const c of active) {
      if (c.type === "CollectEvent") {
        if (c.rules.onlyStory && mode !== "story") continue;
        const delta = Number(signals.collected?.[String(c.rules.targetType)] ?? 0);
        if (delta > 0) {
          const res = await repo.upsertProgress({ address, eventId: c.eventId, delta, required: requiredForCampaign(c), ts: now });
          updates.push({ eventId: c.eventId, ...res });
        }
      }
      if (c.type === "ClearSpecialEvent") {
        if (c.rules.mode !== mode) continue;
        const delta = Number((signals.specialConsumed as any)?.[c.rules.specialType] ?? 0);
        if (delta > 0) {
          const res = await repo.upsertProgress({ address, eventId: c.eventId, delta, required: requiredForCampaign(c), ts: now });
          updates.push({ eventId: c.eventId, ...res });
        }
      }
      if (c.type === "PlayStreakEvent") {
        if (c.rules.mode !== mode) continue;
        const delta = Number(signals.runCompleted?.count ?? 0);
        if (delta > 0) {
          const res = await repo.upsertProgress({ address, eventId: c.eventId, delta, required: requiredForCampaign(c), ts: now });
          updates.push({ eventId: c.eventId, ...res });
        }
      }
    }
    return NextResponse.json({ ok: true, serverNow: Math.floor(now / 1000), updates });
  } catch (e: any) {
    return NextResponse.json({ code: "SERVER_ERROR", message: e?.message || "error" }, { status: 500 });
  }
}
