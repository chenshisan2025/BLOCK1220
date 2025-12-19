"use client";
import { useEffect, useState } from "react";
import { NeonCard } from "../../../../src/components/ui/NeonCard";
import { NeonIcon } from "../../../../src/components/ui/NeonIcon";
import { NeonButton } from "../../../../src/components/ui/NeonButton";
import { RefreshCw, CheckCircle2, Ban } from "lucide-react";

type UIState = "LOADING" | "EMPTY" | "ERROR" | "READY";
type Pending = any;

export default function AdminRiskPendingPage() {
  const [ui, setUi] = useState<UIState>("LOADING");
  const [err, setErr] = useState("");
  const [items, setItems] = useState<Pending[]>([]);
  const [reviewer, setReviewer] = useState("admin");
  const [statusFilter, setStatusFilter] = useState<"pending" | "issued" | "denied">("pending");
  const [sourceFilter, setSourceFilter] = useState<"all" | "EventClaim" | "SponsorCollect" | "SponsorBox">("all");
  const [addressFilter, setAddressFilter] = useState("");
  const [refIdFilter, setRefIdFilter] = useState("");
  async function load() {
    setUi("LOADING");
    setErr("");
    try {
      const qs = new URLSearchParams();
      qs.set("status", statusFilter);
      if (sourceFilter !== "all") qs.set("source", sourceFilter);
      if (addressFilter) qs.set("address", addressFilter);
      if (refIdFilter) qs.set("refId", refIdFilter);
      const res = await fetch(`/api/admin/risk/pending/list?${qs.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const list = json.pending || [];
      setItems(list);
      setUi(list.length ? "READY" : "EMPTY");
    } catch (e: any) {
      setErr(e?.message || "error");
      setUi("ERROR");
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function issue(id: number) {
    const res = await fetch("/api/admin/risk/pending/issue", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ pendingId: id, reviewer, note: "legit -> issue" }),
    });
    if (res.ok) await load();
  }
  async function deny(id: number) {
    const res = await fetch("/api/admin/risk/pending/deny", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ pendingId: id, reviewer, note: "cheat -> deny" }),
    });
    if (res.ok) await load();
  }
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-white text-2xl font-black">Pending Payouts</div>
          <div className="text-white/60 text-sm">Review-delayed rewards queue (server-side only)</div>
        </div>
        <NeonButton onClick={load}>
          <span className="inline-flex items-center gap-2"><NeonIcon icon={RefreshCw} /> Refresh</span>
        </NeonButton>
      </div>
      <NeonCard>
        <div className="text-white font-bold">Reviewer</div>
        <div className="text-white/60 text-xs mb-2">(for audit log)</div>
        <input className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-sm" value={reviewer} onChange={(e) => setReviewer(e.target.value)} />
      </NeonCard>
      <NeonCard>
        <div className="text-white font-bold">Filters</div>
        <div className="text-white/60 text-xs mb-2">status / source / address / refId</div>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <div className="text-white/60 text-xs mb-1">Status</div>
            <select className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
              <option value="pending">pending</option>
              <option value="issued">issued</option>
              <option value="denied">denied</option>
            </select>
          </div>
          <div>
            <div className="text-white/60 text-xs mb-1">Source</div>
            <select className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value as any)}>
              <option value="all">all</option>
              <option value="EventClaim">EventClaim</option>
              <option value="SponsorCollect">SponsorCollect</option>
              <option value="SponsorBox">SponsorBox</option>
            </select>
          </div>
          <div>
            <div className="text-white/60 text-xs mb-1">Address</div>
            <input className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-sm w-72" placeholder="0x..." value={addressFilter} onChange={(e) => setAddressFilter(e.target.value)} />
          </div>
          <div>
            <div className="text-white/60 text-xs mb-1">Ref ID</div>
            <input className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-sm w-56" placeholder="eventId / campaignId / boxId" value={refIdFilter} onChange={(e) => setRefIdFilter(e.target.value)} />
          </div>
          <NeonButton onClick={load}>Apply</NeonButton>
        </div>
      </NeonCard>
      {ui === "LOADING" && (
        <NeonCard>
          <div className="text-white font-bold">Loading</div>
          <div className="text-white/60">Fetching pending rewards...</div>
        </NeonCard>
      )}
      {ui === "ERROR" && (
        <NeonCard>
          <div className="text-white font-bold">Error</div>
          <div className="text-white/60">Failed to load</div>
          <div className="text-red-300 font-mono">{err}</div>
        </NeonCard>
      )}
      {ui === "EMPTY" && (
        <NeonCard>
          <div className="text-white font-bold">Empty</div>
          <div className="text-white/60">No pending payouts</div>
        </NeonCard>
      )}
      {ui === "READY" && (
        <NeonCard>
          <div className="text-white font-bold">Pending Rewards</div>
          <div className="text-white/60 text-xs mb-2">{items.length} pending</div>
          <div className="space-y-2">
            {items.map((p: any) => (
              <div key={p.id} className="border border-white/10 rounded-xl p-3 flex items-start justify-between gap-3">
                <div>
                  <div className="text-white font-mono text-xs">#{p.id} · {p.source} · {p.ref_id}</div>
                  <div className="text-white/60 text-xs font-mono">{p.address}</div>
                  <div className="text-white/50 text-[10px] font-mono">{p.symbol} · {p.amount_wei} · created={new Date(Number(p.created_ts)).toISOString()}</div>
                </div>
                <div className="flex gap-2">
                  <NeonButton onClick={() => issue(p.id)}>
                    <span className="inline-flex items-center gap-2"><NeonIcon icon={CheckCircle2} /> Issue</span>
                  </NeonButton>
                  <NeonButton onClick={() => deny(p.id)}>
                    <span className="inline-flex items-center gap-2"><NeonIcon icon={Ban} /> Deny</span>
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
