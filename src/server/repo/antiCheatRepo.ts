import { getPg } from "../db/pg";
import { migratePg } from "../db/migratePg";
import type { Telemetry, RiskResult } from "../risk/riskModel";

export function antiCheatRepoPg() {
  const sql = getPg();
  return {
    async recordRun(t: Telemetry, r: RiskResult) {
      await migratePg();
      await sql`
        INSERT INTO anti_cheat_runs(
          run_id, ts, day, mode, level_id, address,
          raw_score, effective_time_sec, rank_score,
          revives_used, swaps_total, swaps_valid, cascades_total,
          specials_total, specials_color, specials_bomb, specials_line,
          boss_type, boss_flags, client_meta, server_meta,
          risk_score, risk_reasons, decision, decision_note
        ) VALUES (
          ${t.runId}, ${t.ts}, ${t.day}, ${t.mode}, ${t.levelId ?? null}, ${t.address},
          ${t.rawScore}, ${t.effectiveTimeSec}, ${t.rankScore},
          ${t.revivesUsed}, ${t.swapsTotal}, ${t.swapsValid}, ${t.cascadesTotal},
          ${t.specialsTotal}, ${t.specialsColor}, ${t.specialsBomb}, ${t.specialsLine},
          ${t.bossType ?? null}, ${sql.json(t.bossFlags ?? {})}, ${sql.json(t.clientMeta ?? {})}, ${sql.json(t.serverMeta ?? {})},
          ${r.riskScore}, ${sql.json(r.reasons)}, ${r.decision}, ${r.decisionNote ?? null}
        )
        ON CONFLICT (run_id) DO NOTHING
      `;
      const existing = await sql`
        SELECT address, first_seen, last_seen, runs_total, runs_endless, runs_story, risk_avg, risk_max, decisions
        FROM anti_cheat_addresses
        WHERE address = ${t.address}
        LIMIT 1
      `;
      const now = t.ts;
      if (!existing.length) {
        await sql`
          INSERT INTO anti_cheat_addresses(
            address, first_seen, last_seen, runs_total, runs_endless, runs_story,
            risk_avg, risk_max, decisions, notes
          ) VALUES (
            ${t.address}, ${now}, ${now}, 1,
            ${t.mode === "endless" ? 1 : 0}, ${t.mode === "story" ? 1 : 0},
            ${r.riskScore}, ${r.riskScore},
            ${sql.json({ allow: r.decision === "allow" ? 1 : 0, shadow: r.decision === "shadow" ? 1 : 0, deny: r.decision === "deny" ? 1 : 0, review: r.decision === "review" ? 1 : 0 })},
            ${null}
          )
        `;
      } else {
        const row: any = existing[0];
        const runsTotal = Number(row.runs_total) + 1;
        const riskAvg = Math.round((Number(row.risk_avg) * Number(row.runs_total) + r.riskScore) / runsTotal);
        const riskMax = Math.max(Number(row.risk_max), r.riskScore);
        const decisions = row.decisions || {};
        decisions[r.decision] = (decisions[r.decision] || 0) + 1;
        await sql`
          UPDATE anti_cheat_addresses SET
            last_seen=${now},
            runs_total=${runsTotal},
            runs_endless=${Number(row.runs_endless) + (t.mode === "endless" ? 1 : 0)},
            runs_story=${Number(row.runs_story) + (t.mode === "story" ? 1 : 0)},
            risk_avg=${riskAvg},
            risk_max=${riskMax},
            decisions=${sql.json(decisions)},
            updated_at=NOW()
          WHERE address=${t.address}
        `;
      }
    },
    async enqueueReview(runId: string, address: string) {
      await migratePg();
      await sql`
        INSERT INTO anti_cheat_reviews(run_id, address, created_ts, status)
        VALUES (${runId}, ${address}, ${Date.now()}, 'open')
      `;
    },
    async latestDecision(address: string) {
      await migratePg();
      const rows = await sql`
        SELECT decision
        FROM anti_cheat_runs
        WHERE address=${address}
        ORDER BY ts DESC
        LIMIT 1
      `;
      return rows.length ? String(rows[0].decision) : null;
    },
    async getAddress(address: string) {
      await migratePg();
      const rows = await sql`
        SELECT * FROM anti_cheat_addresses
        WHERE address=${address}
        LIMIT 1
      `;
      return rows.length ? rows[0] : null;
    },
    async listRuns(day: string, minScore = 40) {
      await migratePg();
      const rows = await sql`
        SELECT run_id, ts, address, mode, raw_score, effective_time_sec, rank_score, risk_score, decision, risk_reasons
        FROM anti_cheat_runs
        WHERE day=${day} AND risk_score >= ${minScore}
        ORDER BY risk_score DESC, ts DESC
        LIMIT 500
      `;
      return rows;
    },
    async summary(day: string) {
      await migratePg();
      const rows = await sql`
        SELECT decision, COUNT(*)::int AS n
        FROM anti_cheat_runs
        WHERE day=${day}
        GROUP BY decision
      `;
      return rows;
    },
    async resolveReview(id: number, resolution: "legit" | "cheat" | "unknown", reviewer: string, note?: string) {
      await migratePg();
      await sql`
        UPDATE anti_cheat_reviews SET
          status='resolved',
          resolution=${resolution},
          reviewer=${reviewer},
          note=${note ?? null}
        WHERE id=${id}
      `;
    },
    async listOpenReviews(limit = 100) {
      await migratePg();
      const rows = await sql`
        SELECT id, run_id, address, created_ts, status
        FROM anti_cheat_reviews
        WHERE status='open'
        ORDER BY created_ts DESC
        LIMIT ${limit}
      `;
      return rows;
    },
    async getReviewById(id: number) {
      await migratePg();
      const rows = await sql`
        SELECT id, run_id, address, created_ts, status, resolution, reviewer, note
        FROM anti_cheat_reviews
        WHERE id=${id}
        LIMIT 1
      `;
      return rows.length ? rows[0] : null;
    },
  };
}
