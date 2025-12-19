import { getPg } from "../db/pg";
import { migratePg } from "../db/migratePg";

export type EventCampaignRow = {
  event_id: string;
  title_key: string;
  desc_key: string;
  type: string;
  rules: any;
  reward: any;
  start_at: string;
  end_at: string;
  status: string;
  created_at?: string;
  updated_at?: string;
};

export function eventConfigRepoPg() {
  const sql = getPg();
  return {
    async listAll(): Promise<EventCampaignRow[]> {
      await migratePg();
      const rows = await sql<EventCampaignRow[]>`
        SELECT event_id, title_key, desc_key, type, rules, reward, start_at, end_at, status, created_at, updated_at
        FROM event_campaigns
        ORDER BY start_at DESC
      `;
      return rows;
    },
    async listActive(now: Date): Promise<EventCampaignRow[]> {
      await migratePg();
      const rows = await sql<EventCampaignRow[]>`
        SELECT event_id, title_key, desc_key, type, rules, reward, start_at, end_at, status, created_at, updated_at
        FROM event_campaigns
        WHERE status='active' AND start_at <= ${now.toISOString()} AND end_at >= ${now.toISOString()}
        ORDER BY start_at ASC
      `;
      return rows;
    },
    async getById(eventId: string): Promise<EventCampaignRow | null> {
      await migratePg();
      const rows = await sql<EventCampaignRow[]>`
        SELECT event_id, title_key, desc_key, type, rules, reward, start_at, end_at, status, created_at, updated_at
        FROM event_campaigns
        WHERE event_id = ${eventId}
        LIMIT 1
      `;
      return rows.length ? rows[0] : null;
    },
    async upsert(input: {
      eventId: string;
      titleKey: string;
      descKey: string;
      type: string;
      rules: any;
      reward: any;
      startAt: string;
      endAt: string;
      status: "active" | "inactive";
    }) {
      await migratePg();
      const nowIso = new Date().toISOString();
      await sql`
        INSERT INTO event_campaigns(event_id,title_key,desc_key,type,rules,reward,start_at,end_at,status,created_at,updated_at)
        VALUES (${input.eventId}, ${input.titleKey}, ${input.descKey}, ${input.type},
                ${sql.json(input.rules)}, ${sql.json(input.reward)},
                ${input.startAt}, ${input.endAt}, ${input.status},
                ${nowIso}, ${nowIso})
        ON CONFLICT (event_id) DO UPDATE SET
          title_key=EXCLUDED.title_key,
          desc_key=EXCLUDED.desc_key,
          type=EXCLUDED.type,
          rules=EXCLUDED.rules,
          reward=EXCLUDED.reward,
          start_at=EXCLUDED.start_at,
          end_at=EXCLUDED.end_at,
          status=EXCLUDED.status,
          updated_at=${nowIso}
      `;
      return { ok: true };
    },
    async setStatus(eventId: string, status: "active" | "inactive") {
      await migratePg();
      const nowIso = new Date().toISOString();
      await sql`
        UPDATE event_campaigns SET status=${status}, updated_at=${nowIso}
        WHERE event_id=${eventId}
      `;
      return { ok: true };
    },
    async remove(eventId: string) {
      await migratePg();
      await sql`DELETE FROM event_campaigns WHERE event_id=${eventId}`;
      return { ok: true };
    },
  };
}

export async function listActiveEventCampaigns(now: Date) {
  await migratePg();
  const repo = eventConfigRepoPg();
  const rows = await repo.listActive(now);
  return rows.map((r: any) => ({
    eventId: r.event_id,
    titleKey: r.title_key,
    descKey: r.desc_key,
    type: r.type,
    startAt: new Date(r.start_at).toISOString?.() ?? r.start_at,
    endAt: new Date(r.end_at).toISOString?.() ?? r.end_at,
    rules: r.rules,
    reward: {
      rewardType: "Token",
      symbol: r.reward?.symbol ?? r.reward?.token ?? "FLY",
      amountWei: r.reward?.amountWei ?? r.reward?.amount ?? "0",
      decimals: r.reward?.decimals ?? 18,
    },
  }));
}

export async function getEventCampaignById(eventId: string) {
  await migratePg();
  const repo = eventConfigRepoPg();
  const r: any = await repo.getById(eventId);
  if (!r) return null;
  return {
    eventId: r.event_id,
    titleKey: r.title_key,
    descKey: r.desc_key,
    type: r.type,
    startAt: new Date(r.start_at).toISOString?.() ?? r.start_at,
    endAt: new Date(r.end_at).toISOString?.() ?? r.end_at,
    rules: r.rules,
    reward: {
      rewardType: "Token",
      symbol: r.reward?.symbol ?? r.reward?.token ?? "FLY",
      amountWei: r.reward?.amountWei ?? r.reward?.amount ?? "0",
      decimals: r.reward?.decimals ?? 18,
    },
  };
}
