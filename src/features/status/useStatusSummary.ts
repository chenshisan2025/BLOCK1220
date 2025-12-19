import { useCallback, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { statusSchema, type StatusResponse } from "../../lib/validators/status";

export function useStatusSummary() {
  const locale = useLocale();
  const [data, setData] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/status/summary?lang=${locale}`, { cache: "no-store" });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || `HTTP ${res.status}`);
      }
      const json = await res.json();
      const parsed = statusSchema.safeParse(json);
      if (!parsed.success) throw new Error("Invalid status response");
      setData(parsed.data);
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
