import { getPg } from "../db/pg";
import { migratePg } from "../db/migratePg";

export function eventHistoryRepoPg() {
  const sql = getPg();
  return {
    async listTimeline(now = new Date()) {
      await migratePg();
      const active = await sql`
        SELECT event_id, title_key, desc_key, type, rules, reward, start_at, end_at, status
        FROM event_campaigns
        WHERE status='active' AND start_at <= ${now.toISOString()} AND end_at >= ${now.toISOString()}
        ORDER BY start_at ASC
      `;
      const upcoming = await sql`
        SELECT event_id, title_key, desc_key, type, rules, reward, start_at, end_at, status
        FROM event_campaigns
        WHERE status='active' AND start_at > ${now.toISOString()}
        ORDER BY start_at ASC
      `;
      const ended = await sql`
        SELECT event_id, title_key, desc_key, type, rules, reward, start_at, end_at, status
        FROM event_campaigns
        WHERE status='active' AND end_at < ${now.toISOString()}
        ORDER BY end_at DESC
        LIMIT 50
      `;
      return { active, upcoming, ended };
    },
    async listUserHistory(address: string) {
      await migratePg();
      const completions = await sql`
        SELECT event_id, ts
        FROM event_completions
        WHERE address = ${address}
        ORDER BY ts DESC
        LIMIT 200
      `;
      const claims = await sql`
        SELECT ref_id, ts
        FROM issued_rewards
        WHERE address = ${address} AND reward_type = 'EventReward'
        ORDER BY ts DESC
        LIMIT 200
      `;
      const claimedSet = new Set<string>(claims.map((r: any) => String(r.ref_id)));
      return (completions as any[]).map((c: any) => ({
        eventId: String(c.event_id),
        completedAt: Number(c.ts),
        claimed: claimedSet.has(String(c.event_id)),
      }));
    },
    async getAdminTimeline(now = new Date()) {
      await migratePg();
      const rows = await sql`
        SELECT event_id, title_key, type, start_at, end_at, status, updated_at
        FROM event_campaigns
        ORDER BY start_at DESC
        LIMIT 300
      `;
      return rows;
    },
    async getAdminEventDetail(eventId: string, windowDays = 7) {
      await migratePg();
      const since = Date.now() - windowDays * 24 * 3600 * 1000;
      const [{ participants }] = await sql`
        SELECT COUNT(DISTINCT address)::int AS participants
        FROM event_progress
        WHERE event_id = ${eventId} AND updated_at >= ${since}
      `;
      const [{ completions }] = await sql`
        SELECT COUNT(*)::int AS completions
        FROM event_completions
        WHERE event_id = ${eventId} AND ts >= ${since}
      `;
      const [{ rewardsIssued }] = await sql`
        SELECT COUNT(*)::int AS rewardsIssued
        FROM issued_rewards
        WHERE reward_type='EventReward' AND ref_id = ${eventId} AND ts >= ${since}
      `;
      return {
        eventId,
        windowDays,
        participants: Number(participants),
        completions: Number(completions),
        rewardsIssued: Number(rewardsIssued),
      };
    },
  };
}
