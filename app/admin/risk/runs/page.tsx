"use client";
import { useEffect, useState } from "react";
import { NeonCard } from "../../../../src/components/ui/NeonCard";
import { NeonIcon } from "../../../../src/components/ui/NeonIcon";
import { NeonButton } from "../../../../src/components/ui/NeonButton";
import { RefreshCw, Search, ArrowLeft } from "lucide-react";

type UIState = "LOADING" | "EMPTY" | "ERROR" | "READY";
type RunRow = any;

function dayIdUtc8(ts = Date.now()) {
  const d = new Date(ts + 8 * 3600 * 1000);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function AdminRiskRunsPage() {
  const [ui, setUi] = useState<UIState>("LOADING");
  const [err, setErr] = useState("");
  const [runs, setRuns] = useState<RunRow[]>([]);
  const [day, setDay] = useState(dayIdUtc8());
  const [min, setMin] = useState(40);
  async function load() {
    setUi("LOADING");
    setErr("");
    try {
      const res = await fetch(`/api/admin/risk/runs?day=${encodeURIComponent(day)}&min=${min}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const list = json.runs || [];
      setRuns(list);
      setUi(list.length ? "READY" : "EMPTY");
    } catch (e: any) {
      setErr(e?.message || "error");
      setUi("ERROR");
    }
  }
  useEffect(() => {
    load();
  }, []);
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-white text-2xl font-black">Suspicious Runs</div>
          <div className="text-white/60 text-sm">Server-side risk logs (read-only)</div>
        </div>
        <div className="flex gap-2">
          <NeonButton onClick={() => (window.location.href = "/admin/risk")}>
            <span className="inline-flex items-center gap-2"><NeonIcon icon={ArrowLeft} /> Back</span>
          </NeonButton>
          <NeonButton onClick={load}>
            <span className="inline-flex items-center gap-2"><NeonIcon icon={RefreshCw} /> Refresh</span>
          </NeonButton>
        </div>
      </div>
      <NeonCard>
        <div className="text-white font-bold">Filters</div>
        <div className="text-white/60 text-xs mb-2">Day + min risk score</div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <div className="text-white/60 text-xs mb-1">Day</div>
            <input className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-sm" value={day} onChange={(e) => setDay(e.target.value)} />
          </div>
          <div>
            <div className="text-white/60 text-xs mb-1">Min Score</div>
            <input type="number" className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-sm w-28" value={min} onChange={(e) => setMin(Number(e.target.value))} />
          </div>
          <NeonButton onClick={load}>
            <span className="inline-flex items-center gap-2"><NeonIcon icon={Search} /> Apply</span>
          </NeonButton>
        </div>
      </NeonCard>
      {ui === "LOADING" && (
        <NeonCard>
          <div className="text-white font-bold">Loading</div>
          <div className="text-white/60">Fetching runs...</div>
        </NeonCard>
      )}
      {ui === "ERROR" && (
        <NeonCard>
          <div className="text-white font-bold">Error</div>
          <div className="text-white/60">Failed to load</div>
          <div className="text-red-300 font-mono mt-2">{err}</div>
        </NeonCard>
      )}
      {ui === "EMPTY" && (
        <NeonCard>
          <div className="text-white font-bold">Empty</div>
          <div className="text-white/60">No runs match filters. Try lowering min score.</div>
        </NeonCard>
      )}
      {ui === "READY" && (
        <NeonCard>
          <div className="text-white font-bold">Runs</div>
          <div className="text-white/60 text-xs mb-2">{runs.length} rows</div>
          <div className="space-y-2">
            {runs.map((r: any) => (
              <div key={r.run_id} className="border border-white/10 rounded-xl p-3 flex items-start justify-between gap-3">
                <div>
                  <div className="text-white font-mono text-xs">{r.run_id}</div>
                  <div className="text-white/60 text-xs font-mono">{r.address}</div>
                  <div className="text-white/50 text-[10px] font-mono">
                    mode={r.mode} · raw={r.raw_score} · eff={r.effective_time_sec}s · rank={r.rank_score}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-mono font-black">{r.risk_score}</div>
                  <div className="text-white/60 text-xs font-mono">{r.decision}</div>
                  <NeonButton onClick={() => window.open(`/admin/risk/address?address=${encodeURIComponent(r.address)}`, "_self")}>
                    Address
                  </NeonButton>
                </div>
              </div>
            ))}
          </div>
        </NeonCard>
      )}
    </div>
  );
}
