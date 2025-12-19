"use client";
import { useActiveEvents } from "../../../src/features/events/useActiveEvents";
import { useEventProgress } from "../../../src/features/events/useEventProgress";
import { useEventClaim } from "../../../src/features/events/useEventClaim";
import { NeonCard } from "../../../src/components/ui/NeonCard";
import { NeonButton } from "../../../src/components/ui/NeonButton";
import { NeonIcon } from "../../../src/components/ui/NeonIcon";
import { classes } from "../../../src/design/tokens";
import { useAccount } from "wagmi";
import { RefreshCw, Gift, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { safeT } from "../../../src/features/events/i18n";
import { renderEventRuleSummary } from "../../../src/features/events/renderEventRuleSummary";
import { renderEventBadges } from "../../../src/features/events/renderEventBadges";

const APIS = ["/api/events/active", "/api/events/progress", "/api/events/claim"];
const STATES = { LOADING: "LOADING", ERROR: "ERROR" };

export default function EventsZhPage() {
  const t = useTranslations();
  const tp = useTranslations("eventsPage");
  const tt = useTranslations("eventsType");
  const { address, isConnected } = useAccount();
  const active = useActiveEvents();
  const progress = useEventProgress(address);
  const claim = useEventClaim();
  const progressMap: Map<string, any> = new Map((progress.data?.progress || []).map((p: any) => [p.eventId as string, p]));
  const [timeline, setTimeline] = useState<any | null>(null);
  const [history, setHistory] = useState<any[] | null>(null);
  async function loadTimeline() {
    try {
      const tdata = await fetch("/api/events/timeline", { cache: "no-store" }).then((r) => r.json());
      setTimeline(tdata);
    } catch {}
  }
  async function loadHistory(addr?: string) {
    if (!addr) return;
    try {
      const h = await fetch(`/api/events/history?address=${addr}`, { cache: "no-store" }).then((r) => r.json());
      setHistory(h.items || []);
    } catch {}
  }
  useEffect(() => {
    loadTimeline();
  }, []);
  useEffect(() => {
    if (isConnected && address) loadHistory(address);
  }, [isConnected, address]);
  if (!isConnected) {
    return (
      <div className="p-6">
        <NeonCard>
          <div className="p-4">
            <div className={classes.accent}>{tp("connectFirstTitle")}</div>
            <div className="text-white/60 text-sm">{tp("connectFirstDesc")}</div>
            <div className="text-white/60 text-xs mt-2">{tp("claimHint")}</div>
          </div>
        </NeonCard>
      </div>
    );
  }
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-white text-2xl font-black">{tp("title")}</div>
          <div className="text-white/60 text-sm">{tp("subtitle")}</div>
        </div>
        <NeonButton
          onClick={() => {
            active.reload();
            progress.reload();
          }}
        >
          <NeonIcon icon={RefreshCw} />
          {tp("refresh")}
        </NeonButton>
      </div>
      <NeonCard>
        <div className="p-4">
          <div className={classes.accent}>{tp("sectionActive")}</div>
          <div className="text-white/40 text-xs">{tp("sourceActive")}</div>
          {active.ui === "LOADING" && <div className="text-white/60">{tp("loading")}</div>}
          {active.ui === "ERROR" && <div className="text-red-300 font-mono">{active.error}</div>}
          {timeline && (timeline.active || []).length === 0 && (
            <div>
              <div className="text-white font-bold">{tp("emptyTitle")}</div>
              <div className="text-white/60 text-sm mt-1">{tp("emptyDesc")}</div>
            </div>
          )}
          {timeline && (timeline.active || []).length > 0 && (
            <div className="space-y-3">
              {(timeline.active || []).map((e: any) => {
                const p = progressMap.get(e.eventId);
                const completed = Boolean(p?.completed);
                const current = p?.current ?? 0;
                const required = p?.required ?? 0;
                const title = safeT(t, e.titleKey, e.eventId);
                const desc = safeT(t, e.descKey, "");
                const typeLabel = (() => {
                  try {
                    return tt(e.type);
                  } catch {
                    return e.type;
                  }
                })();
                const badges = renderEventBadges(e, t);
                return (
                  <div key={e.eventId} className="border border白/10 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-bold">{title}</div>
                        {desc && <div className="text-white/60 text-xs">{desc}</div>}
                        <div className="text-white/50 text-[10px] font-mono mt-1">{e.eventId}</div>
                      </div>
                      <div className="text-white/70 text-xs font-mono">
                        {e.startAt} → {e.endAt}
                      </div>
                    </div>
                    <div className="text-white/70 text-sm">{renderEventRuleSummary(e, t)}</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {badges.map((b: any, idx: number) => (
                        <span
                          key={idx}
                          className={`px-2 py-1 rounded-md text-xs font-bold border border-white/10 ${
                            b.tone === "cyan"
                              ? "text-cyan-200"
                              : b.tone === "purple"
                              ? "text-purple-200"
                              : b.tone === "yellow"
                              ? "text-yellow-200"
                              : "text-white/70"
                          }`}
                        >
                          {b.label}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <div className="border border-white/10 rounded-lg px-3 py-2 text-sm">
                        <div className="text-white/60 text-xs">{tp("typeLabel")}</div>
                        <div className="text-white font-mono">{typeLabel}</div>
                      </div>
                      <div className="border border-white/10 rounded-lg px-3 py-2 text-sm">
                        <div className="text-white/60 text-xs">{tp("progressLabel")}</div>
                        <div className="text-white/80 text-sm">
                          <span className="font-mono">{current}</span> / <span className="font-mono">{required}</span>
                          {completed && (
                            <span className="ml-2 inline-flex items-center gap-1 text-green-300">
                              <NeonIcon icon={CheckCircle2} />
                              {tp("completed")}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="border border-white/10 rounded-lg px-3 py-2 text-sm">
                        <div className="text-white/60 text-xs">{tp("rewardLabel")}</div>
                        <div className="text-white font-mono">
                          {e.reward?.symbol} · {e.reward?.amountWei}
                        </div>
                        <div className="text-white/50 text-[10px] mt-1">{tp("weiNote")}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-white/60 text-xs">{tp("claimHint")}</div>
                      <NeonButton
                        onClick={async () => {
                          if (!completed || claim.ui === "CLAIMING") return;
                          await claim.claim(address!, e.eventId);
                          await progress.reload();
                        }}
                      >
                        <NeonIcon icon={Gift} />
                        {claim.ui === "CLAIMING" ? tp("claiming") : tp("claim")}
                      </NeonButton>
                    </div>
                    {claim.ui === "ERROR" && <div className="text-red-300 text-xs font-mono">{claim.error}</div>}
                    {claim.ui === "SUCCESS" && <div className="text-green-300 text-xs">{tp("claimSuccess")}</div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </NeonCard>
      <NeonCard>
        <div className="p-4">
          <div className={classes.accent}>即将开始</div>
          <div className="space-y-3 mt-3">
            {(timeline?.upcoming || []).map((e: any) => {
              const title = safeT(t, e.titleKey, e.eventId);
              const desc = safeT(t, e.descKey, "");
              const badges = renderEventBadges(e, t);
              return (
                <div key={e.eventId} className="border border-white/10 rounded-xl p-4">
                  <div className="text-white font-bold">{title}</div>
                  {desc && <div className="text-white/60 text-xs">{desc}</div>}
                  <div className="text-white/50 text-[10px] font-mono mt-1">{e.eventId}</div>
                  <div className="text-white/70 text-xs font-mono">{e.startAt} → {e.endAt}</div>
                  <div className="text-white/70 text-sm mt-1">{renderEventRuleSummary(e, t)}</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {badges.map((b: any, idx: number) => (
                      <span key={idx} className={`px-2 py-1 rounded-md text-xs font-bold border border-white/10 ${b.tone === "cyan" ? "text-cyan-200" : b.tone === "purple" ? "text-purple-200" : b.tone === "yellow" ? "text-yellow-200" : "text-white/70"}`}>{b.label}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </NeonCard>
      <NeonCard>
        <div className="p-4">
          <div className={classes.accent}>已结束</div>
          <div className="space-y-3 mt-3">
            {(timeline?.ended || []).map((e: any) => {
              const title = safeT(t, e.titleKey, e.eventId);
              const desc = safeT(t, e.descKey, "");
              const badges = renderEventBadges(e, t);
              return (
                <div key={e.eventId} className="border border-white/10 rounded-xl p-4">
                  <div className="text-white font-bold">{title}</div>
                  {desc && <div className="text-white/60 text-xs">{desc}</div>}
                  <div className="text-white/50 text-[10px] font-mono mt-1">{e.eventId}</div>
                  <div className="text-white/70 text-xs font-mono">{e.startAt} → {e.endAt}</div>
                  <div className="text-white/70 text-sm mt-1">{renderEventRuleSummary(e, t)}</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {badges.map((b: any, idx: number) => (
                      <span key={idx} className={`px-2 py-1 rounded-md text-xs font-bold border border-white/10 ${b.tone === "cyan" ? "text-cyan-200" : b.tone === "purple" ? "text-purple-200" : b.tone === "yellow" ? "text-yellow-200" : "text-white/70"}`}>{b.label}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </NeonCard>
      {isConnected && (
        <NeonCard>
          <div className="p-4">
            <div className={classes.accent}>我的历史</div>
            <div className="space-y-3 mt-3">
              {(history || []).map((h: any) => (
                <div key={`${h.eventId}:${h.completedAt}`} className="border border-white/10 rounded-xl p-3 flex items-center justify-between">
                  <div className="text-white/80 text-sm">
                    <span className="font-mono">{h.eventId}</span>
                    <span className="text-white/50 text-xs ml-2">completedAt={h.completedAt}</span>
                  </div>
                  <div className={`text-xs ${h.claimed ? "text-green-300" : "text-white/60"}`}>{h.claimed ? "已领取" : "未领取"}</div>
                </div>
              ))}
            </div>
          </div>
        </NeonCard>
      )}
    </div>
  );
}
