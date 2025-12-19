"use client";
import { useEffect, useState } from "react";
import { NeonCard } from "../../../src/components/ui/NeonCard";
import { NeonIcon } from "../../../src/components/ui/NeonIcon";
import { NeonButton } from "../../../src/components/ui/NeonButton";
import { classes } from "../../../src/design/tokens";
import { RefreshCw, Box as BoxIcon, Percent } from "lucide-react";

type BoxReward = { type: "Token"; symbol: string; amount: string; weight: number };
type SponsorBox = { boxId: string; sponsorId: string; chapter?: number; rewards: BoxReward[] };
type UIState = "LOADING" | "EMPTY" | "ERROR" | "DEGRADED" | "READY";

export default function AdminBoxesPage() {
  const [ui, setUi] = useState<UIState>("LOADING");
  const [items, setItems] = useState<SponsorBox[]>([]);
  const [err, setErr] = useState("");

  async function load() {
    setUi("LOADING");
    setErr("");
    try {
      const res = await fetch("/api/admin/boxes", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { boxes: SponsorBox[]; degraded?: any };
      const list = json.boxes || [];
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
          <div className="text-white text-2xl font-black">Boxes</div>
          <div className="text-white/60 text-sm">Box definitions (weights are server-side only)</div>
        </div>
        <NeonButton onClick={load}>
          <NeonIcon icon={RefreshCw} />
          Refresh
        </NeonButton>
      </div>

      {ui === "DEGRADED" && (
        <NeonCard>
          <div className="p-4 text-yellow-200 text-sm">Showing best-effort box list.</div>
        </NeonCard>
      )}

      {ui === "LOADING" && (
        <NeonCard>
          <div className="p-4">
            <div className={classes.accent}>Loading</div>
            <div className="text-white/60 text-sm">Fetching boxes...</div>
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
            <div className="text-white/60 text-sm">Define boxes via content json (v1) or admin CRUD (future).</div>
          </div>
        </NeonCard>
      )}

      {(ui === "READY" || ui === "DEGRADED") && (
        <NeonCard>
          <div className="p-4">
            <div className={classes.accent}>Box List</div>
            <div className="text-white/60 text-sm">{items.length} boxes</div>
            <div className="space-y-3 mt-3">
              {items.map((b) => (
                <div key={b.boxId} className="space-y-3 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <NeonIcon icon={BoxIcon} />
                    <div>
                      <div className="text-white font-bold">{b.boxId}</div>
                      <div className="text-white/60 text-xs font-mono">Sponsor: {b.sponsorId} · Chapter: {b.chapter ?? "-"}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {b.rewards.map((r, idx) => (
                      <div key={idx} className="border border-white/10 rounded-lg p-3">
                        <div className="text-white/60 text-xs">Reward</div>
                        <div className="text-white font-mono">{r.symbol} {r.amount}</div>
                        <div className="mt-2 flex items-center gap-2">
                          <NeonIcon icon={Percent} />
                          <div className="text-white/70 text-xs font-mono">weight={r.weight}</div>
                        </div>
                        <div className="text-white/50 text-[10px] mt-1">Note: draw happens in API only.</div>
                      </div>
                    ))}
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
