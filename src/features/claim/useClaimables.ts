import { useEffect, useState, useCallback } from "react";
import { useLocale } from "next-intl";
import { claimablesSchema, ClaimablesResponse } from "../../lib/validators/claimables";

export function useClaimables(address?: string) {
  const locale = useLocale();
  const [data, setData] = useState<ClaimablesResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!address) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/claimables?lang=${locale}&address=${address}`, { cache: "no-store" });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || `HTTP ${res.status}`);
      }
      const json = await res.json();
      const parsed = claimablesSchema.safeParse(json);
      if (!parsed.success) throw new Error("Invalid claimables response");
      setData(parsed.data);
    } catch (e: any) {
      setError(e?.message || "Unknown error");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [address, locale]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}
