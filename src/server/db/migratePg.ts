import fs from "fs";
import path from "path";
import { getPg } from "./pg";

let migrated = false;

export async function migratePg() {
  if (migrated) return;
  const sql = getPg();
  const file = path.join(process.cwd(), "src/server/db/pg_migrate.sql");
  const ddl = fs.readFileSync(file, "utf8");
  await sql.unsafe(ddl);
  migrated = true;
}
