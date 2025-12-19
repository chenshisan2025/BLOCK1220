import { NextResponse } from "next/server";
import { getPg } from "../../../../../src/server/db/pg";
import { migratePg } from "../../../../../src/server/db/migratePg";

export async function GET() {
  await migratePg();
  const sql = getPg();
  const since = Date.now() - 7 * 24 * 3600 * 1000;
  const [{ participants }] = await sql`SELECT COUNT(DISTINCT address)::int as participants FROM event_progress WHERE updated_at >= ${since}`;
  const [{ completions }] = await sql`SELECT COUNT(*)::int as completions FROM event_completions WHERE ts >= ${since}`;
  const [{ rewardsIssued }] = await sql`SELECT COUNT(*)::int as rewardsIssued FROM issued_rewards WHERE reward_type='EventReward' AND ts >= ${since}`;
  return NextResponse.json({
    participants: Number(participants),
    completions: Number(completions),
    rewardsIssued: Number(rewardsIssued),
    windowDays: 7,
  });
}
