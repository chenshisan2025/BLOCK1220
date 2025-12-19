import { NextResponse } from "next/server";
import { z } from "zod";
import boxesJson from "../../../../src/content/sponsor/sponsor_boxes_v1.json";
import { addBoxReward } from "../../../../src/server/sponsor/store";
import { sponsorRepoPg } from "../../../../src/server/repo/sponsorRepo";
import { migratePg } from "../../../../src/server/db/migratePg";
import { antiCheatRepoPg } from "../../../../src/server/repo/antiCheatRepo";
import { pendingRewardRepoPg } from "../../../../src/server/repo/pendingRewardRepo";

const bodySchema = z.object({ boxId: z.string(), address: z.string() });

function pickWeighted(rewards: Array<{ type: string; symbol: string; amount: string; weight: number }>) {
  const total = rewards.reduce((s, r) => s + r.weight, 0);
  const r = Math.random() * total;
  let acc = 0;
  for (const item of rewards) {
    acc += item.weight;
    if (r <= acc) return item;
  }
  return rewards[0];
}

export async function POST(req: Request) {
  await migratePg();
  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ code: "BAD_REQUEST" }, { status: 400 });
  const { boxId, address } = parsed.data;
  const box = ((boxesJson as any).boxes || []).find((x: any) => x.boxId === boxId);
  if (!box) return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  const riskRepo = antiCheatRepoPg();
  const addrAgg: any = await riskRepo.getAddress(address);
  const latestDecision = await riskRepo.latestDecision(address);
  if (latestDecision === "deny" || latestDecision === "shadow") {
    return NextResponse.json({ code: "RISK_DENIED", message: "risk gated" }, { status: 400 });
  }
  if ((addrAgg?.risk_max ?? 0) >= 70 || (addrAgg?.decisions?.review ?? 0) > 0 || latestDecision === "review") {
    await pendingRewardRepoPg().enqueue({
      source: "SponsorBox",
      refId: boxId,
      address,
      symbol: "PENDING",
      amountWei: "0",
      decimals: 18,
      createdTs: Date.now(),
      decisionNote: "PENDING_REVIEW_BOX_DRAW_LATER",
    });
    return NextResponse.json({ code: "PENDING_REVIEW", message: "rewards delayed by review" }, { status: 202 });
  }
  const reward = pickWeighted(box.rewards);
  addBoxReward(address, { type: "Token", sponsorId: box.sponsorId, symbol: reward.symbol, amount: reward.amount });
  const repo = sponsorRepoPg();
  const ts = Date.now();
  await repo.recordBoxOpen(box.boxId, address, reward.symbol, reward.amount, ts);
  await repo.recordIssuedReward(address, "SponsorBox", box.boxId, reward.symbol, reward.amount, ts);
  return NextResponse.json({ type: "SponsorBox", sponsorId: box.sponsorId, symbol: reward.symbol, amount: reward.amount });
}
