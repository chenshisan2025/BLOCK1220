import { getPg } from "../db/pg";
import { migratePg } from "../db/migratePg";

export type ProgressUpsert = { address: string; eventId: string; delta: number; required: number; ts: number };

export function eventRepoPg() {
  const sql = getPg();
  return {
    async upsertProgress(input: ProgressUpsert) {
      await migratePg();
      const rows = await sql`
        INSERT INTO event_progress(address, event_id, current, required, updated_at)
        VALUES (${input.address}, ${input.eventId}, ${input.delta}, ${input.required}, ${input.ts})
        ON CONFLICT (address, event_id) DO UPDATE SET
          current = event_progress.current + EXCLUDED.current,
          required = EXCLUDED.required,
          updated_at = EXCLUDED.updated_at
        RETURNING current, required
      `;
      const current = Number(rows[0].current);
      const required = Number(rows[0].required);
      const completed = current >= required;
      if (completed) {
        await sql`
          INSERT INTO event_completions(event_id, address, ts)
          VALUES (${input.eventId}, ${input.address}, ${input.ts})
          ON CONFLICT (event_id, address) DO NOTHING
        `;
      }
      return { current, required, completed };
    },
  };
}
