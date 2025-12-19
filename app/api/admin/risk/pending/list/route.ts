import { NextResponse } from "next/server";
import { z } from "zod";
import { getPg } from "../../../../../../src/server/db/pg";
import { migratePg } from "../../../../../../src/server/db/migratePg";

const qSchema = z.object({
  status: z.enum(["pending", "issued", "denied"]).optional(),
  source: z.enum(["EventClaim", "SponsorCollect", "SponsorBox"]).optional(),
  address: z.string().optional(),
  refId: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(500).optional(),
});

export async function GET(req: Request) {
  try {
    await migratePg();
    const sql = getPg();
    const url = new URL(req.url);
    const parsed = qSchema.safeParse({
      status: url.searchParams.get("status") || undefined,
      source: url.searchParams.get("source") || undefined,
      address: url.searchParams.get("address") || undefined,
      refId: url.searchParams.get("refId") || undefined,
      limit: url.searchParams.get("limit") || undefined,
    });
    if (!parsed.success) {
      return NextResponse.json({ code: "BAD_REQUEST", message: "invalid query" }, { status: 400 });
    }
    const status = parsed.data.status ?? "pending";
    const limit = parsed.data.limit ?? 200;
    const where: any[] = [sql`status = ${status}`];
    if (parsed.data.source) where.push(sql`source = ${parsed.data.source}`);
    if (parsed.data.address) where.push(sql`address = ${parsed.data.address}`);
    if (parsed.data.refId) where.push(sql`ref_id = ${parsed.data.refId}`);
    const rows = await sql`
      SELECT id, source, ref_id, address, symbol, amount_wei, decimals, created_ts, status, decision_note, resolved_by, resolved_ts
      FROM pending_rewards
      WHERE ${sql.join(where, sql` AND `)}
      ORDER BY created_ts DESC
      LIMIT ${limit}
    `;
    return NextResponse.json({ status, pending: rows });
  } catch (e: any) {
    return NextResponse.json({ code: "SERVER_ERROR", message: e?.message || "error" }, { status: 500 });
  }
}
