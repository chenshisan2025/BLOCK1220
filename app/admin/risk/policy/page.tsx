"use client";
import { useEffect, useState } from "react";
import { NeonCard } from "../../../../src/components/ui/NeonCard";
import { NeonButton } from "../../../../src/components/ui/NeonButton";
import { NeonIcon } from "../../../../src/components/ui/NeonIcon";
import { RefreshCw, Save, FileText } from "lucide-react";

type UIState = "LOADING" | "EMPTY" | "ERROR" | "READY";

export default function AdminRiskPolicyPage() {
  const [ui, setUi] = useState<UIState>("LOADING");
  const [err, setErr] = useState("");
  const [policy, setPolicy] = useState<any>(null);
  const [editor, setEditor] = useState("");
  const [audit, setAudit] = useState<any[]>([]);
  const [actor, setActor] = useState("admin");
  const [note, setNote] = useState("");
  async function load() {
    setUi("LOADING");
    setErr("");
    try {
      const res = await fetch("/api/admin/risk/policy", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setPolicy(json);
      setEditor(JSON.stringify(json.config ?? {}, null, 2));
      const a = await fetch("/api/admin/risk/policy/audit", { cache: "no-store" });
      const aj = await a.json();
      setAudit(aj.audit || []);
      setUi("READY");
    } catch (e: any) {
      setErr(e?.message || "error");
      setUi("ERROR");
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function save() {
    try {
      const cfg = JSON.parse(editor);
      const res = await fetch("/api/admin/risk/policy", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ config: cfg, actor, note }) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await load();
    } catch (e: any) {
      setErr(e?.message || "error");
      setUi("ERROR");
    }
  }
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-white text-2xl font-black">Risk Policy</div>
          <div className="text-white/60 text-sm">DB-first configuration with audit log</div>
        </div>
        <div className="flex gap-2">
          <NeonButton onClick={load}>
            <span className="inline-flex items-center gap-2"><NeonIcon icon={RefreshCw} /> Refresh</span>
          </NeonButton>
          <NeonButton onClick={save}>
            <span className="inline-flex items-center gap-2"><NeonIcon icon={Save} /> Save</span>
          </NeonButton>
        </div>
      </div>
      {ui === "LOADING" && (
        <NeonCard>
          <div className="text-white font-bold">Loading</div>
          <div className="text-white/60">Fetching current policy...</div>
        </NeonCard>
      )}
      {ui === "ERROR" && (
        <NeonCard>
          <div className="text-white font-bold">Error</div>
          <div className="text-white/60">Failed to load</div>
          <div className="text-red-300 font-mono text-sm mt-2">{err}</div>
        </NeonCard>
      )}
      {ui === "READY" && policy && (
        <>
          <NeonCard>
            <div className="text-white font-bold">Current</div>
            <div className="text-white/60 text-xs mb-2">version={policy.version} · updatedBy={policy.updatedBy} · updatedTs={policy.updatedTs}</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <div className="text-white font-bold mb-1">JSON Editor</div>
                <textarea className="w-full h-[320px] bg-black/40 border border-white/10 rounded-lg p-3 text-white font-mono text-sm" value={editor} onChange={(e) => setEditor(e.target.value)} />
                <div className="mt-3 flex items-center gap-3">
                  <input className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-sm" placeholder="actor" value={actor} onChange={(e) => setActor(e.target.value)} />
                  <input className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-sm flex-1" placeholder="note" value={note} onChange={(e) => setNote(e.target.value)} />
                </div>
              </div>
              <div>
                <div className="text-white font-bold mb-1 flex items-center gap-2"><NeonIcon icon={FileText} /> Audit (recent)</div>
                <div className="space-y-2">
                  {audit.map((a: any) => (
                    <div key={a.id ?? `${a.actor}-${a.ts}`} className="border border-white/10 rounded-xl p-3">
                      <div className="text-white font-mono text-xs">{a.action} · {a.actor}</div>
                      <div className="text-white/60 text-[10px] font-mono">{a.ts}</div>
                      {a.note && <div className="text-white/60 text-[10px] font-mono">{a.note}</div>}
                    </div>
                  ))}
                  {audit.length === 0 && <div className="text-white/60 text-sm">No audit yet.</div>}
                </div>
              </div>
            </div>
          </NeonCard>
        </>
      )}
    </div>
  );
}
