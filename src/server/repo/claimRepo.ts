import { getPg } from "../db/pg";
import { migratePg } from "../db/migratePg";

export function claimRepoPg() {
  const sql = getPg();
  return {
    async listAddressRewards(address: string) {
      await migratePg();
      const rows = await sql`
        SELECT reward_type, ref_id, symbol, amount, ts
        FROM issued_rewards
        WHERE address = ${address}
        ORDER BY ts DESC
      `;
      return rows.map((r: any) => ({
        rootType: r.reward_type,
        periodId: r.ref_id,
        symbol: r.symbol,
        amount: r.amount,
        ts: Number(r.ts),
      }));
    },
  };
}
