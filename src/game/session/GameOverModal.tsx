"use client";
import { NeonCard } from "../../components/ui/NeonCard";
import { NeonButton } from "../../components/ui/NeonButton";
import { SoundManager } from "../../lib/audio/SoundManager";

export function GameOverModal({
  mode,
  victory,
  rawScore,
  effectiveTime,
  rankScore,
  revivesUsed,
  onPlayAgain,
  onBack,
}: {
  mode: "story" | "endless";
  victory: boolean;
  rawScore: number;
  effectiveTime: number;
  rankScore: number;
  revivesUsed: number;
  onPlayAgain: () => void;
  onBack: () => void;
}) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-[color:var(--neon-bg)/0.6]">
      <NeonCard>
        <div className="p-6 space-y-4 text-center">
          <div className="text-xl font-bold">{mode === "story" ? (victory ? "Victory" : "Game Over") : "Endless Result"}</div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="text-left opacity-80">RawScore</div><div className="text-right font-mono">{rawScore}</div>
            <div className="text-left opacity-80">EffectiveTime</div><div className="text-right font-mono">{effectiveTime}s</div>
            <div className="text-left opacity-80">RevivesUsed</div><div className="text-right font-mono">{revivesUsed}</div>
            {mode === "endless" && (<><div className="text-left opacity-80">RankScore</div><div className="text-right font-mono">{rankScore}</div></>)}
          </div>
          <div className="flex items-center gap-4 justify-center">
            <NeonButton onClick={() => { SoundManager.get().initOnFirstGesture(); onPlayAgain(); }}>Play Again</NeonButton>
            <NeonButton onClick={() => { SoundManager.get().initOnFirstGesture(); onBack(); }}>{mode === "endless" ? "Go Leaderboard" : "Back to Play"}</NeonButton>
          </div>
        </div>
      </NeonCard>
    </div>
  );
}
