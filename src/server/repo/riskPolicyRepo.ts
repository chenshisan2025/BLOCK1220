import { getPg } from "../db/pg";
import { migratePg } from "../db/migratePg";

export function getDefaultRiskConfig() {
  return {
    gates: { enableRiskGating: true, enableShadow: true, enableReview: true, enableDeny: true },
    decisionBands: { shadowMin: 40, reviewMin: 70, denyMin: 85 },
    thresholds: { rankScoreHigh: 20000, swapsRateHigh: 2.2, validSwapRatioHigh: 0.98, specialRateHigh: 0.35, colorSpecialSpike: 6 },
    weights: {
      RANKSCORE_TOO_HIGH: 30,
      SWAPS_RATE_TOO_HIGH: 20,
      VALID_SWAP_RATIO_TOO_HIGH: 15,
      SPECIAL_RATE_ANOMALY: 15,
      COLOR_SPECIAL_SPIKE: 20,
    },
  };
}

export function riskPolicyRepoPg() {
  const sql = getPg();
  const policyId = "default";
  return {
    async seedIfMissing(actor: string) {
      await migratePg();
      const rows = await sql`SELECT policy_id FROM risk_policies WHERE policy_id=${policyId} LIMIT 1`;
      if (rows.length) return { ok: true, seeded: false };
      const now = Date.now();
      const cfg = getDefaultRiskConfig();
      await sql`
        INSERT INTO risk_policies(policy_id, version, status, config, updated_by, updated_ts, created_ts)
        VALUES (${policyId}, ${1}, ${"active"}, ${JSON.stringify(cfg)}, ${actor}, ${now}, ${now})
      `;
      await sql`
        INSERT INTO risk_policy_audit(policy_id, action, before, after, actor, ts, note)
        VALUES (${policyId}, ${"seed"}, ${null}, ${JSON.stringify(cfg)}, ${actor}, ${now}, ${"seed default policy"})
      `;
      return { ok: true, seeded: true };
    },
    async getActive() {
      await migratePg();
      const rows = await sql`
        SELECT policy_id, version, status, config, updated_by, updated_ts
        FROM risk_policies
        WHERE policy_id=${policyId} AND status='active'
        LIMIT 1
      `;
      if (!rows.length) return null;
      const r = rows[0] as any;
      return {
        policyId: String(r.policy_id),
        version: Number(r.version),
        status: String(r.status),
        config: r.config,
        updatedBy: String(r.updated_by || ""),
        updatedTs: Number(r.updated_ts),
      };
    },
    async update(config: any, actor: string, note?: string) {
      await migratePg();
      const cur = await this.getActive();
      const now = Date.now();
      const before = cur?.config ?? null;
      const nextVersion = (cur?.version ?? 0) + 1;
      await sql`
        UPDATE risk_policies
        SET version=${nextVersion}, config=${JSON.stringify(config)}, updated_by=${actor}, updated_ts=${now}
        WHERE policy_id=${policyId}
      `;
      await sql`
        INSERT INTO risk_policy_audit(policy_id, action, before, after, actor, ts, note)
        VALUES (${policyId}, ${"update"}, ${JSON.stringify(before)}, ${JSON.stringify(config)}, ${actor}, ${now}, ${note ?? null})
      `;
      return { ok: true, version: nextVersion };
    },
    async listAudit(limit = 20) {
      await migratePg();
      const rows = await sql`
        SELECT policy_id, action, actor, ts, note
        FROM risk_policy_audit
        WHERE policy_id=${policyId}
        ORDER BY ts DESC
        LIMIT ${limit}
      `;
      return rows;
    },
  };
}
