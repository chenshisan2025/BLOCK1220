import { useEffect, useState, useCallback } from "react";
import { useLocale } from "next-intl";
import type { LiveStatsResponse } from "../../lib/validators/liveStats";

export function useLiveStats() {
  const locale = useLocale();
  const [data, setData] = useState<LiveStatsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/stats/live?lang=${locale}`, { cache: "no-store" });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || `HTTP ${res.status}`);
      }
      const json = (await res.json()) as LiveStatsResponse;
      setData(json);
    } catch (e: any) {
      setError(e?.message || "Unknown error");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}
