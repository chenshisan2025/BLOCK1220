import fs from "fs";
import path from "path";
import { getDb } from "./db";

export function migrate() {
  const db = getDb();
  const schemaPath = path.join(process.cwd(), "src/server/db/schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf8");
  db.exec(sql);
}
