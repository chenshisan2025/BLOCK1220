import { getPg } from "../db/pg";
import { migratePg } from "../db/migratePg";

export function sponsorRepoPg() {
  const sql = getPg();
  return {
    async init() {
      await migratePg();
    },
    async recordCampaignCompletion(campaignId: string, address: string, ts: number) {
      await migratePg();
      await sql`
        INSERT INTO sponsor_campaign_completions(campaign_id,address,ts)
        VALUES (${campaignId}, ${address}, ${ts})
        ON CONFLICT (campaign_id, address) DO NOTHING
      `;
    },
    async recordBoxOpen(boxId: string, address: string, rewardSymbol: string, rewardAmount: string, ts: number) {
      await migratePg();
      await sql`
        INSERT INTO sponsor_box_opens(box_id,address,reward_symbol,reward_amount,ts)
        VALUES (${boxId}, ${address}, ${rewardSymbol}, ${rewardAmount}, ${ts})
      `;
    },
    async recordIssuedReward(address: string, rewardType: string, refId: string, symbol: string, amount: string, ts: number) {
      await migratePg();
      await sql`
        INSERT INTO issued_rewards(address,reward_type,ref_id,symbol,amount,ts)
        VALUES (${address}, ${rewardType}, ${refId}, ${symbol}, ${amount}, ${ts})
      `;
    },
    async listIssuedRewards(address: string) {
      await migratePg();
      const rows = await sql`
        SELECT reward_type AS type, ref_id AS refId, symbol, amount, ts
        FROM issued_rewards
        WHERE address = ${address}
        ORDER BY ts DESC
      `;
      return rows.map((r: any) => ({
        type: r.type,
        refId: r.refId,
        symbol: r.symbol,
        amount: r.amount,
        ts: Number(r.ts),
      }));
    },
    async getSummary(lastDays = 7) {
      await migratePg();
      const since = Date.now() - lastDays * 24 * 3600 * 1000;
      const [{ n: totalSponsors }] = await sql`SELECT COUNT(*)::int as n FROM sponsors`;
      const [{ n: activeCampaigns }] = await sql`
        SELECT COUNT(*)::int as n FROM sponsor_campaigns
        WHERE start_at <= ${Date.now()} AND end_at >= ${Date.now()}
      `;
      const [{ n: totalParticipants }] = await sql`
        SELECT COUNT(DISTINCT address)::int as n FROM sponsor_campaign_completions WHERE ts >= ${since}
      `;
      const [{ n: totalCompletions }] = await sql`
        SELECT COUNT(*)::int as n FROM sponsor_campaign_completions WHERE ts >= ${since}
      `;
      const [{ n: totalBoxesOpened }] = await sql`
        SELECT COUNT(*)::int as n FROM sponsor_box_opens WHERE ts >= ${since}
      `;
      const rewardsBySymbol = await sql`
        SELECT symbol, COUNT(*)::int as cnt
        FROM issued_rewards
        WHERE ts >= ${since} AND reward_type LIKE 'Sponsor%'
        GROUP BY symbol
      `;
      return {
        totalSponsors,
        activeCampaigns,
        totalParticipants,
        totalCompletions,
        totalBoxesOpened,
        rewardsBySymbol,
      };
    },
  };
}
