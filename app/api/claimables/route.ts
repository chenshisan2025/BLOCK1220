import { NextResponse } from "next/server";
import zh from "../../../src/mocks/api_claimables.zh.json";
import en from "../../../src/mocks/api_claimables.en.json";
import { claimablesSchema } from "../../../src/lib/validators/claimables";
import { getDaily, getSettlement } from "../../../src/server/leaderboard/store";
import { claimRepoPg } from "../../../src/server/repo/claimRepo";
import { migratePg } from "../../../src/server/db/migratePg";

export async function GET(req: Request) {
  await migratePg();
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get("lang") === "en" ? "en" : "zh";
  const address = searchParams.get("address");
  if (!address) {
    return NextResponse.json({ code: "BAD_REQUEST", message: "address required" }, { status: 400 });
  }
  const base = lang === "zh" ? { ...zh } : { ...en };
  base.address = address;
  // Append DailyRank claim if settlement exists
  const today = getToday();
  const settlement = await getSettlement(today);
  if (settlement) {
    const d = await getDaily(today);
    const rank = (d.entries || []).find((e: any) => e.address.toLowerCase() === address.toLowerCase());
    if (rank) {
      const amt = (BigInt(rank.rankScore) * (10n ** 18n)).toString();
      const item: any = {
        rootType: "DailyRank",
        periodId: today,
        periodKey: today,
        token: { symbol: "FLY", decimals: 18 },
        amountWei: amt,
        proof: [],
        isClaimed: false,
        isVesting: false,
        rootRef: { rootHash: settlement.merkleRoot, txHash: "0x", ts: Date.now(), explorerUrl: "" },
        meta: { title: "Daily Rank Reward", subtitle: `RankScore ${rank.rankScore}` },
      };
      base.claims = [...base.claims, item];
    }
  }
  const parsed = claimablesSchema.safeParse(base);
  if (!parsed.success) {
    return NextResponse.json({ code: "INVALID_RESPONSE", message: "Schema validation failed" }, { status: 500 });
  }
  const repo = claimRepoPg();
  const dbRewards = await repo.listAddressRewards(address);
  const extras = [];
  for (const r of dbRewards) {
    const typ = String(r.rootType || r.type);
    if (typ.startsWith("Sponsor")) {
      extras.push({
        rootType: "SponsorDrop",
        periodId: r.periodId || r.refId,
        periodKey: r.periodId || r.refId,
        token: { symbol: r.symbol, decimals: 18 },
        amountWei: (BigInt(Math.floor(Number(r.amount) * 10 ** 18))).toString(),
        proof: [],
        isClaimed: false,
        isVesting: false,
        rootRef: { rootHash: "", txHash: "0x", ts: Date.now(), explorerUrl: "" },
        meta: { title: (r.rootType || r.type) === "SponsorBox" ? "Sponsor Box Reward" : "Sponsor Collect Reward", subtitle: r.symbol },
      } as any);
    } else if (typ === "EventReward") {
      extras.push({
        rootType: "EventReward",
        periodId: r.periodId || r.refId,
        periodKey: r.periodId || r.refId,
        token: { symbol: r.symbol, decimals: 18 },
        amountWei: r.amount,
        proof: [],
        isClaimed: false,
        isVesting: false,
        rootRef: { rootHash: "", txHash: "0x", ts: Date.now(), explorerUrl: "" },
        meta: { title: "Event Reward", subtitle: r.periodId || r.refId },
      } as any);
    }
  }
  const merged = { ...parsed.data, claims: [...parsed.data.claims, ...extras] };
  return NextResponse.json(merged);
}

function getToday() {
  const now = Date.now();
  const d = new Date(now);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}
