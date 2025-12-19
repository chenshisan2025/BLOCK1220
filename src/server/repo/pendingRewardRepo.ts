import { getPg } from "../db/pg";
import { migratePg } from "../db/migratePg";

export type PendingRewardInput = {
  source: "EventClaim" | "SponsorCollect" | "SponsorBox";
  refId: string;
  address: string;
  symbol: string;
  amountWei: string;
  decimals: number;
  createdTs: number;
  decisionNote?: string;
};

export function pendingRewardRepoPg() {
  const sql = getPg();
  return {
    async enqueue(input: PendingRewardInput) {
      await migratePg();
      await sql`
        INSERT INTO pending_rewards(source, ref_id, address, symbol, amount_wei, decimals, created_ts, status, decision_note)
        VALUES (${input.source}, ${input.refId}, ${input.address}, ${input.symbol}, ${input.amountWei}, ${input.decimals}, ${input.createdTs}, 'pending', ${input.decisionNote ?? null})
        ON CONFLICT (source, ref_id, address) DO NOTHING
      `;
      return { ok: true };
    },
    async listPending(limit = 200) {
      await migratePg();
      const rows = await sql`
        SELECT id, source, ref_id, address, symbol, amount_wei, decimals, created_ts, status, decision_note
        FROM pending_rewards
        WHERE status = 'pending'
        ORDER BY created_ts DESC
        LIMIT ${limit}
      `;
      return rows;
    },
    async markDenied(id: number, resolvedBy: string, note?: string) {
      await migratePg();
      await sql`
        UPDATE pending_rewards
        SET status='denied', resolved_by=${resolvedBy}, resolved_ts=${Date.now()}, decision_note=${note ?? null}
        WHERE id=${id} AND status='pending'
      `;
      return { ok: true };
    },
    async markIssued(id: number, issuedRewardId: number, resolvedBy: string, note?: string) {
      await migratePg();
      await sql`
        UPDATE pending_rewards
        SET status='issued', issued_reward_id=${issuedRewardId}, resolved_by=${resolvedBy}, resolved_ts=${Date.now()}, decision_note=${note ?? null}
        WHERE id=${id} AND status='pending'
      `;
      return { ok: true };
    },
    async getById(id: number) {
      await migratePg();
      const rows = await sql`
        SELECT id, source, ref_id, address, symbol, amount_wei, decimals, created_ts, status
        FROM pending_rewards
        WHERE id=${id}
        LIMIT 1
      `;
      return rows.length ? rows[0] : null;
    },
    async listPendingByAddress(address: string) {
      await migratePg();
      const rows = await sql`
        SELECT id, source, ref_id, address, symbol, amount_wei, decimals, created_ts, status
        FROM pending_rewards
        WHERE address=${address} AND status='pending'
        ORDER BY created_ts DESC
        LIMIT 500
      `;
      return rows;
    },
    async issuePending(id: number, reviewer: string, note?: string) {
      await migratePg();
      const p: any = await this.getById(id);
      if (!p || p.status !== "pending") return { ok: false };
      let symbol = String(p.symbol);
      let amountWei = String(p.amount_wei);
      if (p.source === "SponsorBox") {
        const boxesJson = await import("../../content/sponsor/sponsor_boxes_v1.json");
        const box = ((boxesJson as any).default.boxes || []).find((x: any) => String(x.boxId) === String(p.ref_id));
        if (!box) return { ok: false };
        const rewards = box.rewards || [];
        const total = rewards.reduce((a: number, r: any) => a + (r.weight || 0), 0);
        let x = Math.random() * total;
        let drawn = rewards[0];
        for (const r of rewards) {
          x -= (r.weight || 0);
          if (x <= 0) {
            drawn = r;
            break;
          }
        }
        symbol = drawn.symbol;
        amountWei = drawn.amountWei ?? drawn.amount ?? "0";
      }
      const existing = await sql`
        SELECT id FROM issued_rewards
        WHERE address=${p.address} AND reward_type=${p.source} AND ref_id=${p.ref_id}
        LIMIT 1
      `;
      let issuedId: number;
      if (existing.length) {
        issuedId = Number(existing[0].id);
      } else {
        const rows = await sql`
          INSERT INTO issued_rewards(address, reward_type, ref_id, symbol, amount, ts)
          VALUES (${p.address}, ${p.source}, ${p.ref_id}, ${symbol}, ${amountWei}, ${Date.now()})
          RETURNING id
        `;
        issuedId = Number(rows[0].id);
      }
      await this.markIssued(id, issuedId, reviewer, note);
      return { ok: true, issuedId, symbol, amountWei };
    },
  };
}
