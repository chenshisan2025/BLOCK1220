"use client";
import { useEffect, useState } from "react";
import { NeonCard } from "../../../src/components/ui/NeonCard";
import { NeonIcon } from "../../../src/components/ui/NeonIcon";
import { NeonButton } from "../../../src/components/ui/NeonButton";
import { classes } from "../../../src/design/tokens";
import { RefreshCw, ExternalLink, Users } from "lucide-react";

type Sponsor = { sponsorId: string; name: string; logo?: string | null; website?: string | null; twitter?: string | null };
type UIState = "LOADING" | "EMPTY" | "ERROR" | "DEGRADED" | "READY";

export default function AdminSponsorsPage() {
  const [ui, setUi] = useState<UIState>("LOADING");
  const [items, setItems] = useState<Sponsor[]>([]);
  const [err, setErr] = useState("");

  async function load() {
    setUi("LOADING");
    setErr("");
    try {
      const res = await fetch("/api/admin/sponsors", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { sponsors: Sponsor[]; degraded?: any };
      const list = json.sponsors || [];
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
          <div className="text-white text-2xl font-black">Sponsors</div>
          <div className="text-white/60 text-sm">Read-only list of sponsor partners</div>
        </div>
        <NeonButton onClick={load}>
          <NeonIcon icon={RefreshCw} />
          Refresh
        </NeonButton>
      </div>

      {ui === "DEGRADED" && (
        <NeonCard>
          <div className="p-4">
            <div className={classes.warning}>Data may be delayed</div>
            <div className="text-yellow-200 text-sm">DB/Indexer latency detected. Showing best-effort data.</div>
          </div>
        </NeonCard>
      )}

      {ui === "LOADING" && (
        <NeonCard>
          <div className="p-4">
            <div className={classes.accent}>Loading</div>
            <div className="text-white/60 text-sm">Fetching sponsors...</div>
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
            <div className="text-white/60 text-sm">Add sponsors via content json or admin CRUD (future).</div>
          </div>
        </NeonCard>
      )}

      {(ui === "READY" || ui === "DEGRADED") && (
        <NeonCard>
          <div className="p-4">
            <div className={classes.accent}>Sponsor List</div>
            <div className="text-white/60 text-sm">{items.length} sponsors</div>
            <div className="space-y-3 mt-3">
              {items.map((s) => (
                <div key={s.sponsorId} className="border border-white/10 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <NeonIcon icon={Users} />
                    <div>
                      <div className="text-white font-bold">{s.name}</div>
                      <div className="text-white/60 text-xs font-mono">{s.sponsorId}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {s.website && (
                      <NeonButton onClick={() => window.open(s.website!, "_blank")}>
                        <NeonIcon icon={ExternalLink} />
                        Website
                      </NeonButton>
                    )}
                    {s.twitter && (
                      <NeonButton onClick={() => window.open(s.twitter!, "_blank")}>
                        <NeonIcon icon={ExternalLink} />
                        X
                      </NeonButton>
                    )}
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
