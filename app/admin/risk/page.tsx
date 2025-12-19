"use client";
import { useEffect, useState } from "react";
import { NeonCard } from "../../../src/components/ui/NeonCard";
import { NeonIcon } from "../../../src/components/ui/NeonIcon";
import { NeonButton } from "../../../src/components/ui/NeonButton";
import { classes } from "../../../src/design/tokens";
import { RefreshCw, AlertTriangle, Shield, Eye, Ban, CheckCircle2 } from "lucide-react";

type UIState = "LOADING" | "EMPTY" | "ERROR" | "DEGRADED" | "READY";
type Summary = { day: string; counts: { allow: number; shadow: number; review: number; deny: number }; openReviews: any[] };

export default function AdminRiskPage() {
  const [ui, setUi] = useState<UIState>("LOADING");
  const [data, setData] = useState<Summary | null>(null);
  const [err, setErr] = useState("");
  async function load() {
    setUi("LOADING");
    setErr("");
    try {
      const res = await fetch("/api/admin/risk/summary", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as Summary;
      setData(json);
      const empty =
        (json.openReviews?.length ?? 0) === 0 &&
        (json.counts?.shadow ?? 0) === 0 &&
        (json.counts?.review ?? 0) === 0 &&
        (json.counts?.deny ?? 0) === 0;
      setUi(empty ? "EMPTY" : "READY");
    } catch (e: any) {
      setErr(e?.message || "error");
      setUi("ERROR");
    }
  }
  useEffect(() => {
    load();
  }, []);
  const c = data?.counts || { allow: 0, shadow: 0, review: 0, deny: 0 };
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-white text-2xl font-black">Risk Control</div>
          <div className="text-white/60 text-sm">Anti-cheat runs, decisions, and review queue</div>
        </div>
        <div className="flex gap-2">
          <NeonButton onClick={load}>
            <span className="inline-flex items-center gap-2"><NeonIcon icon={RefreshCw} /> Refresh</span>
          </NeonButton>
          <NeonButton onClick={() => (window.location.href = "/admin/risk/runs")}>
            <span className="inline-flex items-center gap-2"><NeonIcon icon={Eye} /> View Runs</span>
          </NeonButton>
        </div>
      </div>
      {ui === "LOADING" && (
        <NeonCard>
          <div className="text-white font-bold">Loading</div>
          <div className="text-white/60">Fetching risk summary...</div>
        </NeonCard>
      )}
      {ui === "ERROR" && (
        <NeonCard>
          <div className="text-white font-bold">Error</div>
          <div className="text-white/60">Failed to load</div>
          <div className="text-red-300 font-mono text-sm mt-2">{err}</div>
          <div className="mt-3">
            <NeonButton onClick={load}>Retry</NeonButton>
          </div>
        </NeonCard>
      )}
      {ui === "EMPTY" && (
        <NeonCard>
          <div className="text-white font-bold">All Clear</div>
          <div className="text-white/60 text-sm">No suspicious activity detected today</div>
        </NeonCard>
      )}
      {ui === "READY" && data && (
        <>
          <NeonCard>
            <div className="text-white font-bold">Decision Summary</div>
            <div className="text-white/60 text-xs mb-3">Day: {data.day}</div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <NeonCard>
                <div className="text-white font-bold mb-1">Allow</div>
                <div className="flex items-center justify-between">
                  <div className="font-mono text-3xl font-black text-white">{c.allow}</div>
                  <NeonIcon icon={CheckCircle2} />
                </div>
              </NeonCard>
              <NeonCard>
                <div className="text-white font-bold mb-1">Shadow</div>
                <div className="text-white/60 text-xs">No leaderboard + no rewards</div>
                <div className="flex items-center justify-between">
                  <div className="font-mono text-3xl font-black text-white">{c.shadow}</div>
                  <NeonIcon icon={Shield} />
                </div>
              </NeonCard>
              <NeonCard>
                <div className="text-white font-bold mb-1">Review</div>
                <div className="text-white/60 text-xs">Delayed rewards</div>
                <div className="flex items-center justify-between">
                  <div className="font-mono text-3xl font-black text-white">{c.review}</div>
                  <NeonIcon icon={AlertTriangle} />
                </div>
              </NeonCard>
              <NeonCard>
                <div className="text-white font-bold mb-1">Deny</div>
                <div className="text-white/60 text-xs">No leaderboard + no rewards</div>
                <div className="flex items-center justify-between">
                  <div className="font-mono text-3xl font-black text-white">{c.deny}</div>
                  <NeonIcon icon={Ban} />
                </div>
              </NeonCard>
            </div>
          </NeonCard>
          <NeonCard>
            <div className="text-white font-bold">Open Reviews</div>
            <div className="text-white/60 text-xs mb-2">{data.openReviews?.length ?? 0} open</div>
            {(data.openReviews?.length ?? 0) === 0 ? (
              <div className="text-white/60 text-sm">No open reviews.</div>
            ) : (
              <div className="space-y-2">
                {data.openReviews.map((r: any) => (
                  <div key={r.id} className="border border-white/10 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <div className="text-white font-mono text-sm">#{r.id} · {r.run_id}</div>
                      <div className="text-white/60 text-xs font-mono">{r.address}</div>
                    </div>
                    <div className="flex gap-2">
                      <NeonButton onClick={() => (window.location.href = `/admin/risk/runs?day=${data.day}&min=70`)}>
                        Review
                      </NeonButton>
                      <NeonButton
                        onClick={async () => {
                          await fetch("/api/admin/risk/reviews/resolveAndIssue", {
                            method: "POST",
                            headers: { "content-type": "application/json" },
                            body: JSON.stringify({ reviewId: r.id, resolution: "legit", reviewer: "admin", note: "Legit+Issue" }),
                          });
                          await load();
                        }}
                      >
                        Legit+Issue
                      </NeonButton>
                      <NeonButton
                        onClick={async () => {
                          await fetch("/api/admin/risk/reviews/resolveAndIssue", {
                            method: "POST",
                            headers: { "content-type": "application/json" },
                            body: JSON.stringify({ reviewId: r.id, resolution: "cheat", reviewer: "admin", note: "Cheat deny" }),
                          });
                          await load();
                        }}
                      >
                        Cheat
                      </NeonButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </NeonCard>
        </>
      )}
    </div>
  );
}
