"use client";
import { NeonCard } from "../../components/ui/NeonCard";
import { NeonButton } from "../../components/ui/NeonButton";

export function ReviveModal({ used, max, onRevive, onEnd }: { used: number; max: number; onRevive: () => void; onEnd: () => void }) {
  const can = used < max;
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-[color:var(--neon-bg)/0.6]">
      <NeonCard>
        <div className="p-6 space-y-4 text-center">
          <div className="text-xl font-bold">时间到，是否复活 +30 秒？</div>
          <div className="opacity-80">Revives {used}/{max}</div>
          <div className="flex items-center gap-4 justify-center">
            <NeonButton onClick={onEnd}>End Run</NeonButton>
            <NeonButton onClick={can ? onRevive : undefined}>{can ? "Revive" : "Revive (Maxed)"}</NeonButton>
          </div>
        </div>
      </NeonCard>
    </div>
  );
}
