"use client";
import { useEffect, useState } from "react";
import { NeonCard } from "../../../../src/components/ui/NeonCard";
import { NeonIcon } from "../../../../src/components/ui/NeonIcon";
import { NeonButton } from "../../../../src/components/ui/NeonButton";
import { ArrowLeft, RefreshCw } from "lucide-react";

type UIState = "LOADING" | "ERROR" | "EMPTY" | "READY";

export default function AdminRiskAddressPage() {
  const url = new URL(typeof window !== "undefined" ? window.location.href : "http://x");
  const address = url.searchParams.get("address") || "";
  const [ui, setUi] = useState<UIState>("LOADING");
  const [err, setErr] = useState("");
  const [profile, setProfile] = useState<any>(null);
  async function load() {
    setUi("LOADING");
    setErr("");
    try {
      const res = await fetch(`/api/admin/risk/address?address=${encodeURIComponent(address)}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setProfile(json.profile);
      setUi(json.profile ? "READY" : "EMPTY");
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
          <div className="text-white text-2xl font-black">Address Risk</div>
          <div className="text-white/60 text-sm font-mono">{address}</div>
        </div>
        <div className="flex gap-2">
          <NeonButton variant="secondary" onClick={() => (window.location.href = "/admin/risk")} className="gap-2">
            <NeonIcon icon={ArrowLeft} color="cyan" /> Back
          </NeonButton>
          <NeonButton variant="secondary" onClick={load} className="gap-2">
            <NeonIcon icon={RefreshCw} color="cyan" /> Refresh
          </NeonButton>
        </div>
      </div>
      {ui === "LOADING" && (
        <NeonCard title="Loading" subtitle="Fetching address profile...">
          <div className="text-white/60">Loading...</div>
        </NeonCard>
      )}
      {ui === "ERROR" && (
        <NeonCard title="Error" subtitle="Failed to load">
          <div className="text-red-300 font-mono">{err}</div>
        </NeonCard>
      )}
      {ui === "EMPTY" && (
        <NeonCard title="Empty" subtitle="No profile found">
          <div className="text-white/60">No runs recorded yet.</div>
        </NeonCard>
      )}
      {ui === "READY" && profile && (
        <NeonCard title="Profile" subtitle="Aggregated stats">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="border border-white/10 rounded-xl p-3">
              <div className="text-white/60 text-xs">Runs</div>
              <div className="text-white font-mono">total={profile.runs_total} · endless={profile.runs_endless} · story={profile.runs_story}</div>
            </div>
            <div className="border border-white/10 rounded-xl p-3">
              <div className="text-white/60 text-xs">Risk</div>
              <div className="text-white font-mono">avg={profile.risk_avg} · max={profile.risk_max}</div>
            </div>
            <div className="border border-white/10 rounded-xl p-3 md:col-span-2">
              <div className="text-white/60 text-xs">Decisions</div>
              <div className="text-white font-mono text-sm whitespace-pre-wrap">{JSON.stringify(profile.decisions, null, 2)}</div>
            </div>
          </div>
        </NeonCard>
      )}
    </div>
  );
}
