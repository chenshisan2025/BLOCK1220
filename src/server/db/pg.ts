import postgres from "postgres";

let sql: ReturnType<typeof postgres> | null = null;

function looksLikePooler(url: string) {
  return url.includes("pooler.supabase.com") || url.includes(":6543");
}

export function getPg() {
  if (sql) return sql;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  if (process.env.NODE_ENV === "production" && !looksLikePooler(url)) {
    console.warn("[PG] DATABASE_URL does not look like a Supabase pooler connection string.");
  }
  sql = postgres(url, {
    max: Number(process.env.PG_MAX_CONNECTIONS || "5"),
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: "require",
  });
  return sql;
}
