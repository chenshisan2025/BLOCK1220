"use client";
import GameSessionShell from "../../../../src/game/session/GameSessionShell";
import { NeonCard } from "../../../../src/components/ui/NeonCard";
import { classes } from "../../../../src/design/tokens";
import { NeonIcon } from "../../../../src/components/ui/NeonIcon";
import { Gamepad2 } from "lucide-react";
import { useTranslations } from "next-intl";

export default function EnPlayGame() {
  const t = useTranslations("pages.play");
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <NeonCard>
        <div className="flex items-center gap-2">
          <NeonIcon icon={Gamepad2} />
          <h1 className={classes.accent}>{t("title")}</h1>
        </div>
      </NeonCard>
      <GameSessionShell />
    </div>
  );
}
