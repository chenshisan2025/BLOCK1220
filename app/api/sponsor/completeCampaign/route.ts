import { NextResponse } from "next/server";
import { z } from "zod";
import campaignsJson from "../../../../src/content/sponsor/sponsor_campaigns_v1.json";
import { addCollectReward } from "../../../../src/server/sponsor/store";
import { sponsorRepoPg } from "../../../../src/server/repo/sponsorRepo";
import { migratePg } from "../../../../src/server/db/migratePg";
import { antiCheatRepoPg } from "../../../../src/server/repo/antiCheatRepo";
import { pendingRewardRepoPg } from "../../../../src/server/repo/pendingRewardRepo";

const bodySchema = z.object({ campaignId: z.string(), address: z.string() });

export async function POST(req: Request) {
  await migratePg();
  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ code: "BAD_REQUEST" }, { status: 400 });
  const { campaignId, address } = parsed.data;
  const c = ((campaignsJson as any).campaigns || []).find((x: any) => x.campaignId === campaignId);
  if (!c) return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  const riskRepo = antiCheatRepoPg();
  const addrAgg: any = await riskRepo.getAddress(address);
  const latestDecision = await riskRepo.latestDecision(address);
  if (latestDecision === "deny" || latestDecision === "shadow") {
    return NextResponse.json({ code: "RISK_DENIED", message: "risk gated" }, { status: 400 });
  }
  if ((addrAgg?.risk_max ?? 0) >= 70 || (addrAgg?.decisions?.review ?? 0) > 0 || latestDecision === "review") {
    await pendingRewardRepoPg().enqueue({
      source: "SponsorCollect",
      refId: campaignId,
      address,
      symbol: c.reward.symbol,
      amountWei: c.reward.amount,
      decimals: 18,
      createdTs: Date.now(),
      decisionNote: "PENDING_REVIEW",
    });
    return NextResponse.json({ code: "PENDING_REVIEW", message: "rewards delayed by review" }, { status: 202 });
  }
  addCollectReward(address, { type: "Token", sponsorId: c.sponsorId, symbol: c.reward.symbol, amount: c.reward.amount, campaignId });
  const repo = sponsorRepoPg();
  const ts = Date.now();
  await repo.recordCampaignCompletion(campaignId, address, ts);
  await repo.recordIssuedReward(address, "SponsorCollect", campaignId, c.reward.symbol, c.reward.amount, ts);
  return NextResponse.json({ ok: true });
}
