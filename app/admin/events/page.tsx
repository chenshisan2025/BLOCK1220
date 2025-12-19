"use client";
import { useEffect, useState } from "react";
import { NeonCard } from "../../../src/components/ui/NeonCard";
import { NeonIcon } from "../../../src/components/ui/NeonIcon";
import { NeonButton } from "../../../src/components/ui/NeonButton";
import { classes } from "../../../src/design/tokens";
import { CalendarDays, RefreshCw, Trophy, Plus, Pencil, Power, Trash2 } from "lucide-react";

export default function AdminEventsPage() {
  const [ui, setUi] = useState<"LOADING" | "EMPTY" | "ERROR" | "DEGRADED" | "READY">("LOADING");
  const [active, setActive] = useState<any[]>([]);
  const [summary, setSummary] = useState<any | null>(null);
  const [err, setErr] = useState("");
  const [configRows, setConfigRows] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [draft, setDraft] = useState<string>("");
  const [timeline, setTimeline] = useState<any[]>([]);
  const [detail, setDetail] = useState<any | null>(null);
  async function load() {
    setUi("LOADING");
    setErr("");
    try {
      const a = await fetch("/api/events/active", { cache: "no-store" }).then((r) => r.json());
      const s = await fetch("/api/admin/events/summary", { cache: "no-store" }).then((r) => r.json());
      const cfg = await fetch("/api/admin/events", { cache: "no-store" }).then((r) => r.json());
      const tl = await fetch("/api/admin/events/timeline", { cache: "no-store" }).then((r) => r.json());
      setActive(a.active || []);
      setSummary(s);
      setConfigRows(cfg.events || []);
      setTimeline(tl.events || []);
      setUi((a.active || []).length ? "READY" : "EMPTY");
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
          <div className="text-white text-2xl font-black">Events</div>
          <div className="text-white/60 text-sm">Active campaigns and KPI (read-only)</div>
        </div>
        <div className="flex gap-2">
          <NeonButton onClick={load}>
            <NeonIcon icon={RefreshCw} />
            Refresh
          </NeonButton>
          <NeonButton onClick={() => {
            setEditing({ event_id: "", title_key: "", desc_key: "", type: "CollectEvent", rules: {}, reward: { rewardType: "Token", symbol: "FLY", amountWei: "0", decimals: 18 }, start_at: new Date().toISOString(), end_at: new Date(Date.now() + 7 * 864e5).toISOString(), status: "inactive" });
            setDraft(JSON.stringify({ eventId: "", titleKey: "", descKey: "", type: "CollectEvent", rules: { targetType: 9, requiredCount: 100, onlyStory: true }, reward: { rewardType: "Token", symbol: "sFLY", amountWei: "50000000000000000000", decimals: 18 }, startAt: new Date().toISOString(), endAt: new Date(Date.now() + 3 * 864e5).toISOString(), status: "inactive" }, null, 2));
          }}>
            <NeonIcon icon={Plus} />
            New
          </NeonButton>
        </div>
      </div>
      {ui === "LOADING" && (
        <NeonCard>
          <div className="p-4">
            <div className={classes.accent}>Loading</div>
            <div className="text-white/60 text-sm">Fetching events and KPI...</div>
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
            <div className="text-white/60 text-sm">No active events</div>
          </div>
        </NeonCard>
      )}
      {(ui === "READY" || ui === "DEGRADED") && (
        <>
          <NeonCard>
            <div className="p-4">
              <div className="flex items-center gap-2">
                <NeonIcon icon={Trophy} />
                <div className={classes.accent}>KPI (7d)</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                <div>
                  <div className={classes.accent}>Participants</div>
                  <div className="font-mono text-white">{summary?.participants ?? 0}</div>
                </div>
                <div>
                  <div className={classes.accent}>Completions</div>
                  <div className="font-mono text-white">{summary?.completions ?? 0}</div>
                </div>
                <div>
                  <div className={classes.accent}>Rewards Issued</div>
                  <div className="font-mono text-white">{summary?.rewardsIssued ?? 0}</div>
                </div>
              </div>
            </div>
          </NeonCard>
          <NeonCard>
            <div className="p-4">
              <div className="flex items-center gap-2">
                <NeonIcon icon={CalendarDays} />
                <div className={classes.accent}>Timeline</div>
              </div>
              <div className="space-y-3 mt-3">
                {timeline.map((row: any) => (
                  <div key={row.event_id} className="border border-white/10 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <div className="text-white font-bold">{row.event_id}</div>
                      <div className="text-white/60 text-xs font-mono">{row.type} · {row.status}</div>
                      <div className="text-white/50 text-[10px] font-mono">{row.start_at} → {row.end_at}</div>
                    </div>
                    <NeonButton onClick={async () => {
                      const d = await fetch(`/api/admin/events/detail?eventId=${row.event_id}`, { cache: "no-store" }).then((r) => r.json());
                      setDetail(d);
                    }}>
                      Detail
                    </NeonButton>
                  </div>
                ))}
              </div>
              {detail && (
                <div className="mt-4 border border-white/10 rounded-xl p-4">
                  <div className="text-white font-bold">Detail · {detail.eventId}</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                    <div>
                      <div className={classes.accent}>Participants</div>
                      <div className="font-mono text-white">{detail.participants}</div>
                    </div>
                    <div>
                      <div className={classes.accent}>Completions</div>
                      <div className="font-mono text-white">{detail.completions}</div>
                    </div>
                    <div>
                      <div className={classes.accent}>Rewards Issued</div>
                      <div className="font-mono text-white">{detail.rewardsIssued}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </NeonCard>
          <NeonCard>
            <div className="p-4">
              <div className="flex items-center gap-2">
                <NeonIcon icon={CalendarDays} />
                <div className={classes.accent}>Active Events</div>
              </div>
              <div className="space-y-3 mt-3">
                {active.map((ev: any) => (
                  <div key={ev.eventId} className="border border-white/10 rounded-xl p-4">
                    <div className="text-white font-bold">{ev.titleKey}</div>
                    <div className="text-white/60 text-xs font-mono">{ev.eventId}</div>
                    <div className="text-white/70 text-xs">{ev.descKey}</div>
                    <div className="text-white/60 text-xs mt-1">type={ev.type}</div>
                  </div>
                ))}
              </div>
            </div>
          </NeonCard>
          <NeonCard>
            <div className="p-4">
              <div className="flex items-center gap-2">
                <NeonIcon icon={Pencil} />
                <div className={classes.accent}>Events Config (DB)</div>
              </div>
              <div className="space-y-3 mt-3">
                {configRows.map((row: any) => (
                  <div key={row.event_id} className="border border-white/10 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <div className="text-white font-bold">{row.event_id}</div>
                      <div className="text-white/60 text-xs font-mono">{row.type} · {row.status}</div>
                      <div className="text-white/50 text-[10px] font-mono">{row.start_at} → {row.end_at}</div>
                    </div>
                    <div className="flex gap-2">
                      <NeonButton onClick={() => { setEditing(row); setDraft(JSON.stringify({ eventId: row.event_id, titleKey: row.title_key, descKey: row.desc_key, type: row.type, rules: row.rules, reward: row.reward, startAt: row.start_at, endAt: row.end_at, status: row.status }, null, 2)); }}>
                        <NeonIcon icon={Pencil} />
                        Edit
                      </NeonButton>
                      <NeonButton onClick={async () => {
                        const status = row.status === "active" ? "inactive" : "active";
                        await fetch(`/api/admin/events/${row.event_id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status }) });
                        await load();
                      }}>
                        <NeonIcon icon={Power} />
                        {row.status === "active" ? "Disable" : "Enable"}
                      </NeonButton>
                      <NeonButton onClick={async () => { if (!confirm("Delete event?")) return; await fetch(`/api/admin/events/${row.event_id}`, { method: "DELETE" }); await load(); }}>
                        <NeonIcon icon={Trash2} />
                        Delete
                      </NeonButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </NeonCard>
          {editing && (
            <NeonCard>
              <div className="p-4">
                <div className={classes.accent}>Event Editor</div>
                <textarea className="w-full h-80 bg-black/40 border border-white/10 rounded-lg p-3 font-mono text-xs text-white outline-none" value={draft} onChange={(e) => setDraft(e.target.value)} />
                <div className="mt-3 flex gap-2">
                  <NeonButton onClick={async () => {
                    try {
                      const payload = JSON.parse(draft);
                      const res = await fetch("/api/admin/events", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
                      if (!res.ok) throw new Error(await res.text());
                      setEditing(null);
                      setDraft("");
                      await load();
                    } catch (e: any) {
                      alert(e?.message || "Save failed");
                    }
                  }}>
                    Save
                  </NeonButton>
                  <NeonButton onClick={() => { setEditing(null); setDraft(""); }}>Cancel</NeonButton>
                </div>
                <div className="text-white/50 text-[10px] mt-2">Admin config only; reward issuance via /api/events/claim.</div>
              </div>
            </NeonCard>
          )}
        </>
      )}
    </div>
  );
}
