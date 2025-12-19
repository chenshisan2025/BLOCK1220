"use client";
import { useEffect, useState } from "react";
import { NeonCard } from "../../../src/components/ui/NeonCard";
import { NeonIcon } from "../../../src/components/ui/NeonIcon";
import { NeonButton } from "../../../src/components/ui/NeonButton";
import { classes } from "../../../src/design/tokens";
import { RefreshCw, CalendarClock, CheckCircle2 } from "lucide-react";

type Campaign = {
  campaignId: string;
  sponsorId: string;
  type: "Collect";
  startAt: string;
  endAt: string;
  collect?: { targetType: number; requiredCount: number };
  reward?: { type: "Token"; symbol: string; amount: string };
};
type UIState = "LOADING" | "EMPTY" | "ERROR" | "DEGRADED" | "READY";

export default function AdminCampaignsPage() {
  const [ui, setUi] = useState<UIState>("LOADING");
  const [items, setItems] = useState<Campaign[]>([]);
  const [err, setErr] = useState("");

  async function load() {
    setUi("LOADING");
    setErr("");
    try {
      const res = await fetch("/api/admin/campaigns", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { campaigns: Campaign[]; degraded?: any };
      const list = json.campaigns || [];
      setItems(list);
      if (json.degraded?.status === "degraded") setUi("DEGRADED");
      else setUi(list.length ? "READY" : "EMPTY");
    } catch (e: any) {
      setErr(e?.message || "Unknown error");
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
          <div className="text-white text-2xl font-black">Campaigns</div>
          <div className="text-white/60 text-sm">Collect campaigns & reward definitions (read-only)</div>
        </div>
        <NeonButton onClick={load}>
          <NeonIcon icon={RefreshCw} />
          Refresh
        </NeonButton>
      </div>

      {ui === "DEGRADED" && (
        <NeonCard>
          <div className="p-4 text-yellow-200 text-sm">Showing best-effort campaign list.</div>
        </NeonCard>
      )}

      {ui === "LOADING" && (
        <NeonCard>
          <div className="p-4">
            <div className={classes.accent}>Loading</div>
            <div className="text-white/60 text-sm">Fetching campaigns...</div>
          </div>
        </NeonCard>
      )}

      {ui === "ERROR" && (
        <NeonCard>
          <div className="p-4">
            <div className={classes.accent}>Error</div>
            <div className="text-red-300 text-sm font-mono">{err}</div>
            <div className="mt-3">
              <NeonButton onClick={load}>Retry</NeonButton>
            </div>
          </div>
        </NeonCard>
      )}

      {ui === "EMPTY" && (
        <NeonCard>
          <div className="p-4">
            <div className={classes.accent}>Empty</div>
            <div className="text-white/60 text-sm">Define campaigns via content json (v1) or admin CRUD (future).</div>
          </div>
        </NeonCard>
      )}

      {(ui === "READY" || ui === "DEGRADED") && (
        <NeonCard>
          <div className="p-4">
            <div className={classes.accent}>Campaign List</div>
            <div className="text-white/60 text-sm">{items.length} campaigns</div>
            <div className="space-y-3 mt-3">
              {items.map((c) => (
                <div key={c.campaignId} className="border border-white/10 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-bold">{c.campaignId}</div>
                      <div className="text-white/60 text-xs font-mono">Sponsor: {c.sponsorId}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <NeonIcon icon={CalendarClock} />
                      <div className="text-white/70 text-xs font-mono">
                        {c.startAt} → {c.endAt}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <div className="border border-white/10 rounded-lg px-3 py-2 text-sm">
                      <div className="text-white/60 text-xs">Collect</div>
                      <div className="text-white font-mono">type={c.collect?.targetType} × {c.collect?.requiredCount}</div>
                    </div>
                    <div className="border border-white/10 rounded-lg px-3 py-2 text-sm">
                      <div className="text-white/60 text-xs">Reward</div>
                      <div className="text-white font-mono">{c.reward?.symbol} {c.reward?.amount}</div>
                    </div>
                    <div className="border border-white/10 rounded-lg px-3 py-2 text-sm flex items-center gap-2">
                      <NeonIcon icon={CheckCircle2} />
                      <div className="text-white/80 text-xs">Server-side settlement</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </NeonCard>
      )}
    </div>
  );
}
