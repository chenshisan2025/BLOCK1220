import { NextResponse } from "next/server";
import { z } from "zod";
import { getPg } from "../../../../src/server/db/pg";
import { migratePg } from "../../../../src/server/db/migratePg";
import { getEventCampaignById } from "../../../../src/server/repo/eventConfigRepo";
import { antiCheatRepoPg } from "../../../../src/server/repo/antiCheatRepo";
import { pendingRewardRepoPg } from "../../../../src/server/repo/pendingRewardRepo";

const bodySchema = z.object({ address: z.string().min(3), eventId: z.string().min(3) });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ code: "BAD_REQUEST", message: "invalid body" }, { status: 400 });
  const { address, eventId } = parsed.data;
  const event = await getEventCampaignById(eventId);
  if (!event) return NextResponse.json({ code: "NOT_FOUND", message: "event not found" }, { status: 404 });
  await migratePg();
  const sql = getPg();
  const now = Date.now();
  const riskRepo = antiCheatRepoPg();
  const addrAgg: any = await riskRepo.getAddress(address);
  const latestDecision = await riskRepo.latestDecision(address);
  if (latestDecision === "deny" || latestDecision === "shadow") {
    return NextResponse.json({ code: "RISK_DENIED", message: "risk gated" }, { status: 400 });
  }
  if ((addrAgg?.risk_max ?? 0) >= 70 || (addrAgg?.decisions?.review ?? 0) > 0 || latestDecision === "review") {
    await pendingRewardRepoPg().enqueue({
      source: "EventClaim",
      refId: eventId,
      address,
      symbol: event.reward.symbol,
      amountWei: event.reward.amountWei,
      decimals: event.reward.decimals ?? 18,
      createdTs: Date.now(),
      decisionNote: "PENDING_REVIEW",
    });
    return NextResponse.json({ code: "PENDING_REVIEW", message: "rewards delayed by review" }, { status: 202 });
  }
  const rows = await sql`
    SELECT current, required
    FROM event_progress
    WHERE address = ${address} AND event_id = ${eventId}
    LIMIT 1
  `;
  if (!rows.length) return NextResponse.json({ code: "NOT_READY", message: "event not started" }, { status: 400 });
  const current = Number(rows[0].current);
  const required = Number(rows[0].required);
  if (current < required) return NextResponse.json({ code: "NOT_READY", message: "event not completed" }, { status: 400 });
  await sql`
    INSERT INTO event_completions(event_id, address, ts)
    VALUES (${eventId}, ${address}, ${now})
    ON CONFLICT (event_id, address) DO NOTHING
  `;
  const issued = await sql`
    SELECT id FROM issued_rewards WHERE address=${address} AND reward_type='EventReward' AND ref_id=${eventId} LIMIT 1
  `;
  if (issued.length) return NextResponse.json({ ok: true, alreadyClaimed: true });
  await sql`
    INSERT INTO issued_rewards(address, reward_type, ref_id, symbol, amount, ts)
    VALUES (${address}, 'EventReward', ${eventId}, ${event.reward.symbol}, ${event.reward.amountWei}, ${now})
  `;
  return NextResponse.json({ ok: true });
}
