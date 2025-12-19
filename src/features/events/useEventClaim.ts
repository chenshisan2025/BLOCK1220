"use client";
import { useState } from "react";

export function useEventClaim() {
  const [ui, setUi] = useState<"IDLE" | "CLAIMING" | "ERROR" | "SUCCESS">("IDLE");
  const [error, setError] = useState("");
  async function claim(address: string, eventId: string) {
    setUi("CLAIMING");
    setError("");
    try {
      const res = await fetch("/api/events/claim", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ address, eventId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);
      setUi("SUCCESS");
      return json;
    } catch (e: any) {
      setError(e?.message || "error");
      setUi("ERROR");
      throw e;
    }
  }
  function reset() {
    setUi("IDLE");
    setError("");
  }
  return { ui, error, claim, reset };
}
