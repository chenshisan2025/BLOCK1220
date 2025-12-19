"use client";
import { useEffect, useState } from "react";

export function useActiveEvents() {
  const [data, setData] = useState<any>(null);
  const [ui, setUi] = useState<"LOADING" | "ERROR" | "READY">("LOADING");
  const [error, setError] = useState("");
  async function reload() {
    setUi("LOADING");
    setError("");
    try {
      const res = await fetch("/api/events/active", { cache: "no-store" });
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
  }, []);
  return { data, ui, error, reload };
}
