"use client";
import { useSearchParams } from "next/navigation";
import PixiGame from "../pixi/PixiGame";
import { useState, useEffect, useRef } from "react";
import { useHudModel } from "../ui/useHudModel";
import { ReviveModal } from "./ReviveModal";
import { GameOverModal } from "./GameOverModal";
import { STORY_MODE, ENDLESS_MODE } from "./mode";
import { loadStoryLevels, getLevel } from "../story/levelLoader";
import { NeonCard } from "../../components/ui/NeonCard";
import { classes } from "../../design/tokens";
import { createLevelRuntime } from "../story/levelRuntime";
import { createBossControllerByProfileId } from "../story/boss/bossRegistry";
import type { BossController } from "../story/boss/bossTypes";
import { createLCGRng } from "../story/boss/_rng";
import type { BossCtx } from "../story/boss/bossTypes";
import type { RunResult } from "./runResult";
import { getCampaign, getSponsor, getBox } from "../story/sponsorLoader";
import { SoundManager } from "../../lib/audio/SoundManager";

export default function GameSessionShell() {
  const sp = useSearchParams();
  const mode = (sp.get("mode") || "story") as "story" | "endless";
  const cfg = mode === "endless" ? ENDLESS_MODE : STORY_MODE;
  const [engineState, setEngineState] = useState<any | null>(null);
  const hud = useHudModel({ mode, state: engineState });
  const [revivesUsed, setRevivesUsed] = useState(0);
  const [reviveToken, setReviveToken] = useState(0);
  const [session, setSession] = useState<"RUNNING" | "TIME_UP" | "VICTORY" | "GAME_OVER">("RUNNING");
  const levelId = Number(sp.get("level") ?? 1);
  let level: any = null;
  let levelError = false;
  try {
    level = getLevel(levelId);
  } catch (e) {
    levelError = true;
  }
  const runtime = createLevelRuntime(level);
  let bossController: BossController | null = createBossControllerByProfileId(level.bossProfileId).controller;
  const [telegraph, setTelegraph] = useState<{ kind: string; secondsLeft: number; messageKey: string; severity: string } | null>(null);
  const gridSize = level.gridSize ?? 6;
  const baseSeed = typeof level.seedRules === "number" ? Number(level.seedRules) : level.levelId * 100000 + 42;
  const rng = createLCGRng(baseSeed);
  const bossCtxRef = useRef<BossCtx>({ nowMs: 0, swapCount: 0, gridSize, rng });

  const timeSeconds = hud.timeSeconds;
  if (session === "RUNNING" && timeSeconds <= 0) setSession("TIME_UP");
  if (mode === "story") {
    runtime.updateFromEngine(engineState);
    if (runtime.isVictory() && session !== "VICTORY" && session !== "GAME_OVER") setSession("VICTORY");
    const delta = runtime.getCollectDelta();
    if (delta && Object.keys(delta).length > 0) {
      (async () => {
        let address = "0x0000000000000000000000000000000000000000";
        try {
          const eth = (window as any).ethereum;
          if (eth) {
            const accounts: string[] = await eth.request({ method: "eth_accounts" });
            if (accounts && accounts[0]) address = accounts[0];
          }
        } catch {}
        try {
          await fetch("/api/events/report", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address, mode, signals: { collected: Object.fromEntries(Object.entries(delta).map(([k, v]) => [String(k), Number(v)]) as any) } }),
          });
        } catch {}
      })();
    }
  }

  const isPaused = session !== "RUNNING";

  function onRevive() {
    if (revivesUsed >= cfg.reviveMax) return;
    SoundManager.get().initOnFirstGesture();
    setRevivesUsed((x) => x + 1);
    setReviveToken((x) => x + 1);
    setSession("RUNNING");
  }
  function onEndRun() {
    setSession("GAME_OVER");
  }
  const effectiveTime = cfg.limitSeconds + revivesUsed * cfg.reviveAddSeconds;
  const rankScore = mode === "endless" ? Math.floor((hud.score * 60) / effectiveTime) : 0;
  const [sponsorHud, setSponsorHud] = useState<{ name: string; logo?: string; progress?: { current: number; required: number } } | null>(null);
  const telemetryRef = useRef({
    revivesUsed: 0,
    swapsTotal: 0,
    swapsValid: 0,
    cascadesTotal: 0,
    specialsTotal: 0,
    specialsLine: 0,
    specialsBomb: 0,
    specialsColor: 0,
  });

  useEffect(() => {
    if (!bossController) return;
    if (isPaused) return;
    const id = window.setInterval(() => {
      bossCtxRef.current.nowMs += 1000;
      bossController.onTick(1000, bossCtxRef.current);
      const tg = bossController.getTelegraph();
      setTelegraph(tg as any);
      const sMeta = level?.sponsor;
      if (sMeta) {
        const camp = sMeta.campaignId ? getCampaign(sMeta.campaignId) : null;
        const sp = sMeta.campaignId ? getSponsor(camp?.sponsorId || "") : null;
        if (camp && sp) {
          const target = camp.collect.targetType;
          const g = runtime.getGoalUIModel();
          const current = g.kind === "Collect" && g.type === target ? g.current : 0;
          setSponsorHud({ name: sp.name, logo: sp.logo, progress: { current, required: g.kind === "Collect" ? g.target : 0 } });
        }
      } else {
        setSponsorHud(null);
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [bossController, isPaused]);

  useEffect(() => {
    if (mode !== "endless") return;
    if (session !== "GAME_OVER") return;
    (async () => {
      let address = "0x0000000000000000000000000000000000000000";
      try {
        const eth = (window as any).ethereum;
        if (eth) {
          const accounts: string[] = await eth.request({ method: "eth_accounts" });
          if (accounts && accounts[0]) address = accounts[0];
        }
      } catch {}
      const result: RunResult = {
        mode: "endless",
        address,
        rawScore: hud.score,
        effectiveTimeSec: effectiveTime,
        rankScore: Math.floor((hud.score * 60) / effectiveTime),
        timestamp: Date.now(),
        telemetry: {
          revivesUsed,
          swapsTotal: telemetryRef.current.swapsTotal,
          swapsValid: telemetryRef.current.swapsValid,
          cascadesTotal: telemetryRef.current.cascadesTotal,
          specialsTotal: telemetryRef.current.specialsTotal,
          specialsLine: telemetryRef.current.specialsLine,
          specialsBomb: telemetryRef.current.specialsBomb,
          specialsColor: telemetryRef.current.specialsColor,
        },
      };
      try {
        await fetch("/api/leaderboard/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(result),
        });
      } catch {}
      try {
        await fetch("/api/events/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address, mode, signals: { runCompleted: { count: 1 } } }),
        });
      } catch {}
    })();
  }, [session, mode, hud.score, effectiveTime]);

  useEffect(() => {
    if (mode !== "story") return;
    if (session !== "VICTORY") return;
    (async () => {
      const sponsorMeta = level?.sponsor;
      if (!sponsorMeta) return;
      let address = "0x0000000000000000000000000000000000000000";
      try {
        const eth = (window as any).ethereum;
        if (eth) {
          const accounts: string[] = await eth.request({ method: "eth_accounts" });
          if (accounts && accounts[0]) address = accounts[0];
        }
      } catch {}
      const campaign = sponsorMeta.campaignId ? getCampaign(sponsorMeta.campaignId) : null;
      if (campaign && campaign.type === "Collect") {
        const target = campaign.collect.targetType;
        const g = runtime.getGoalUIModel();
        const current = g.kind === "Collect" && g.type === target ? g.current : 0;
        if (current >= (g.kind === "Collect" ? g.target : 0)) {
          try {
            await fetch("/api/sponsor/completeCampaign", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ campaignId: campaign.campaignId, address }),
            });
          } catch {}
        }
      }
      const box = sponsorMeta.boxId ? getBox(sponsorMeta.boxId) : null;
      if (box) {
        try {
          await fetch("/api/sponsor/openBox", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ boxId: box.boxId, address }),
          });
        } catch {}
      }
    })();
  }, [session, mode]);

  return (
    <div className="relative">
      {levelError && (
        <div className="mb-4">
          <NeonCard>
            <div className="p-4">
              <h2 className={classes.accent}>Error</h2>
              <p className="opacity-80">Invalid levelId. Please choose 1..100.</p>
            </div>
          </NeonCard>
        </div>
      )}
      <PixiGame
        mode={mode}
        isPaused={isPaused}
        reviveToken={reviveToken}
        reviveAddMs={cfg.reviveAddSeconds * 1000}
        onState={setEngineState}
        bossController={bossController as any}
        telegraph={telegraph as any}
        bossCtx={bossCtxRef.current as any}
        sponsor={sponsorHud as any}
        onEventSignals={async (signals: any) => {
          if (signals?.swap) {
            telemetryRef.current.swapsTotal += Number(signals.swap.total || 0);
            telemetryRef.current.swapsValid += Number(signals.swap.valid || 0);
          }
          if (signals?.cascade) {
            telemetryRef.current.cascadesTotal += Number(signals.cascade || 0);
          }
          if (signals?.specials) {
            telemetryRef.current.specialsTotal += Number(signals.specials.total || 0);
            telemetryRef.current.specialsLine += Number(signals.specials.Line || 0);
            telemetryRef.current.specialsBomb += Number(signals.specials.Bomb || 0);
            telemetryRef.current.specialsColor += Number(signals.specials.Color || 0);
          }
          const forwardSignals: any = { ...signals };
          if (signals?.specials) {
            forwardSignals.specialConsumed = {
              Line: Number(signals.specials.Line || 0),
              Bomb: Number(signals.specials.Bomb || 0),
              Color: Number(signals.specials.Color || 0),
            };
          }
          let address = "0x0000000000000000000000000000000000000000";
          try {
            const eth = (window as any).ethereum;
            if (eth) {
              const accounts: string[] = await eth.request({ method: "eth_accounts" });
              if (accounts && accounts[0]) address = accounts[0];
            }
          } catch {}
          try {
            await fetch("/api/events/report", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ address, mode, signals: forwardSignals }) });
          } catch {}
        }}
      />
      {session === "TIME_UP" && <ReviveModal used={revivesUsed} max={cfg.reviveMax} onRevive={onRevive} onEnd={onEndRun} />}
      {(session === "VICTORY" || session === "GAME_OVER") && (
        <GameOverModal
          mode={mode}
          victory={session === "VICTORY"}
          rawScore={hud.score}
          effectiveTime={effectiveTime}
          rankScore={rankScore}
          revivesUsed={revivesUsed}
          onPlayAgain={() => (window.location.href = `/zh/play/game?mode=${mode}`)}
          onBack={() => (window.location.href = mode === "endless" ? "/zh/leaderboard" : "/zh/play")}
        />
      )}
    </div>
  );
}
