"use client";
import { useEffect, useState } from "react";

export function useEventProgress(address?: string) {
  const [data, setData] = useState<any>(null);
  const [ui, setUi] = useState<"IDLE" | "LOADING" | "ERROR" | "READY">("IDLE");
  const [error, setError] = useState("");
  async function reload() {
    if (!address) {
      setUi("IDLE");
      setData(null);
      return;
    }
    setUi("LOADING");
    setError("");
    try {
      const res = await fetch(`/api/events/progress?address=${address}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setUi("READY");
    } catch (e: any) {
      setError(e?.message || "error");
      setUi("ERROR");
    }
  }
  useEffect(() => {
    reload();
  }, [address]);
  return { data, ui, error, reload };
}
