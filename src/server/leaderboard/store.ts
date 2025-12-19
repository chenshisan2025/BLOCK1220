import { getPg } from "../db/pg";
import { migratePg } from "../db/migratePg";

function dayIdUtc8(ts = Date.now()) {
  const d = new Date(ts + 8 * 3600 * 1000);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export type RunResultRow = {
  day: string;
  address: string;
  rawScore: number;
  effectiveTimeSec: number;
  rankScore: number;
  ts: number;
};

export async function submitRun(run: { address: string; rawScore: number; effectiveTimeSec: number; rankScore: number; ts: number }) {
  await migratePg();
  const sql = getPg();
  const day = dayIdUtc8(run.ts);
  await sql`
    INSERT INTO leaderboard_runs(day,address,raw_score,effective_time_sec,rank_score,ts)
    VALUES (${day}, ${run.address}, ${run.rawScore}, ${run.effectiveTimeSec}, ${run.rankScore}, ${run.ts})
  `;
  return { day };
}

export async function getDaily(day?: string) {
  await migratePg();
  const sql = getPg();
  const d = day ?? dayIdUtc8(Date.now());
  const rows = await sql`
    SELECT address, rank_score, raw_score, effective_time_sec
    FROM leaderboard_runs
    WHERE day = ${d}
    ORDER BY rank_score DESC, raw_score DESC, effective_time_sec ASC
    LIMIT 300
  `;
  return {
    day: d,
    entries: rows.map((r: any) => ({
      address: r.address,
      rankScore: Number(r.rank_score),
      rawScore: Number(r.raw_score),
      effectiveTimeSec: Number(r.effective_time_sec),
    })),
  };
}

export async function ensureSettlement(day?: string) {
  await migratePg();
  const sql = getPg();
  const d = day ?? dayIdUtc8(Date.now());
  const existing = await sql`
    SELECT day, merkle_root, total_reward, ts
    FROM leaderboard_settlements
    WHERE day = ${d}
    LIMIT 1
  `;
  if (existing.length) {
    return {
      day: existing[0].day,
      merkleRoot: existing[0].merkle_root,
      totalReward: existing[0].total_reward,
      ts: Number(existing[0].ts),
    };
  }
  const merkleRoot = `0x${Buffer.from(`root:${d}`).toString("hex").padEnd(64, "0").slice(0, 64)}`;
  const totalReward = "1000";
  const ts = Date.now();
  await sql`
    INSERT INTO leaderboard_settlements(day, merkle_root, total_reward, ts)
    VALUES (${d}, ${merkleRoot}, ${totalReward}, ${ts})
  `;
  return { day: d, merkleRoot, totalReward, ts };
}

export async function getSettlement(day?: string) {
  await migratePg();
  const sql = getPg();
  const d = day ?? dayIdUtc8(Date.now());
  const rows = await sql`
    SELECT day, merkle_root, total_reward, ts
    FROM leaderboard_settlements
    WHERE day = ${d}
    LIMIT 1
  `;
  if (!rows.length) return null;
  return { day: rows[0].day, merkleRoot: rows[0].merkle_root, totalReward: rows[0].total_reward, ts: Number(rows[0].ts) };
}
