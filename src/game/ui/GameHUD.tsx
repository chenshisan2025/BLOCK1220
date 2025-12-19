"use client";
import { NeonCard } from "../../components/ui/NeonCard";
import { NeonIcon } from "../../components/ui/NeonIcon";
import { NeonButton } from "../../components/ui/NeonButton";
import { Timer, Trophy, Zap, ArrowLeft } from "lucide-react";
import { useHudModel, GameMode } from "./useHudModel";
import { SoundManager } from "../../lib/audio/SoundManager";

export default function GameHUD({
  mode,
  state,
  onExit,
  telegraph,
  sponsor,
}: {
  mode: GameMode;
  state: any | null;
  onExit: () => void;
  telegraph?: { kind: string; secondsLeft: number; messageKey: string; severity: string } | null;
  sponsor?: { name: string; logo?: string; progress?: { current: number; required: number } } | null;
}) {
  const m = useHudModel({ mode, state });
  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {!SoundManager.get().isUnlocked() && (
        <div className="pointer-events-auto absolute top-3 left-1/2 -translate-x-1/2">
          <NeonCard>
            <button
              className="px-4 py-2 flex items-center gap-2 text-white"
              onClick={() => SoundManager.get().initOnFirstGesture()}
            >
              <NeonIcon icon={Zap} />
              <div className="font-mono text-sm font-bold">Sound Locked — Tap to enable</div>
            </button>
          </NeonCard>
        </div>
      )}
      <div className="pointer-events-auto absolute top-3 left-3">
        <NeonCard>
          <div className="px-4 py-3 flex items-center gap-2">
            <NeonIcon icon={Timer} />
            <div className={`font-mono text-2xl font-black ${m.isTimeCritical ? "text-red-300 animate-pulse" : "text-white"}`}>{m.timeSeconds}s</div>
          </div>
        </NeonCard>
      </div>
      {mode === "story" && telegraph && (
        <div className="pointer-events-auto absolute top-3 left-1/2 -translate-x-1/2">
          <NeonCard>
            <div className="px-4 py-3 flex items-center gap-2">
              <NeonIcon icon={Timer} />
              <div className="font-mono text-lg font-bold text-yellow-300">{telegraph.messageKey}</div>
              <div className="font-mono text-lg font-bold text-white">{telegraph.secondsLeft}s</div>
            </div>
          </NeonCard>
        </div>
      )}
      {mode === "story" && sponsor && (
        <div className="pointer-events-auto absolute top-20 left-1/2 -translate-x-1/2">
          <NeonCard>
            <div className="px-4 py-3 flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-white/10" />
              <div className="font-mono text-sm text-white">{sponsor.name}</div>
              {sponsor.progress && (
                <div className="font-mono text-sm text-cyan-200">
                  {sponsor.progress.current}/{sponsor.progress.required}
                </div>
              )}
            </div>
          </NeonCard>
        </div>
      )}
      <div className="pointer-events-auto absolute top-3 right-3">
        <NeonCard>
          <div className="px-4 py-3 flex items-center gap-2">
            <NeonIcon icon={Trophy} />
            <div className="font-mono text-2xl font-black text-white">{m.score}</div>
          </div>
        </NeonCard>
      </div>
      <div className="pointer-events-auto absolute bottom-3 right-3 space-y-2">
        {m.showCombo && (
          <NeonCard>
            <div className="px-4 py-3 flex items-center gap-2">
              <NeonIcon icon={Zap} />
              <div className="font-mono text-lg font-black text-purple-200">COMBO x{m.combo}</div>
            </div>
          </NeonCard>
        )}
        {mode === "endless" && (
          <NeonCard>
            <div className="px-4 py-3 flex items-center gap-2">
              <NeonIcon icon={Zap} />
              <div className="text-sm font-bold text-cyan-200">{m.hashSurge.active ? `HashSurge x${m.hashSurge.stacks} (${m.hashSurge.secondsLeft}s)` : "HashSurge —"}</div>
            </div>
          </NeonCard>
        )}
      </div>
      <div className="pointer-events-auto absolute bottom-3 left-3">
        <NeonButton onClick={onExit}>
          <span className="flex items-center gap-2">
            <NeonIcon icon={ArrowLeft} />
            Exit
          </span>
        </NeonButton>
      </div>
    </div>
  );
}
