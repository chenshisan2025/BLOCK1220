"use client";
import { NeonCard } from "../../src/components/ui/NeonCard";
import { NeonButton } from "../../src/components/ui/NeonButton";
import { NeonIcon } from "../../src/components/ui/NeonIcon";
import { LoaderCircle, Ban, TriangleAlert, Zap } from "lucide-react";
import { classes } from "../../src/design/tokens";
import { useTranslations } from "next-intl";
import { DemoContainer } from "../../src/components/demo/DemoContainer";
import { LiveStatsPanel } from "../../src/features/stats/LiveStatsPanel";
import NetworkBanner from "../../src/components/web3/NetworkBanner";

export default function EnHome() {
  const t = useTranslations("pages.home");
  const s = useTranslations("states");
  const n = useTranslations("nav");
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <NeonCard>
        <div className="flex items-center gap-2">
          <NeonIcon icon={Zap} />
          <h1 className={classes.accent}>{t("title")}</h1>
        </div>
        <p>{t("desc")}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          <NeonButton>{s("loading.title")}</NeonButton>
          <NeonButton>{s("empty.title")}</NeonButton>
          <NeonButton>{s("error.title")}</NeonButton>
          <NeonButton>{s("degraded.title")}</NeonButton>
        </div>
      </NeonCard>
      <DemoContainer />
      <NetworkBanner />
      <NeonCard>
        <h2 className={classes.accent}>{useTranslations("home.stats")("title")}</h2>
        <div className="mt-3">
          <LiveStatsPanel />
        </div>
      </NeonCard>
      <NeonCard>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <NeonCard><div className="flex items-center gap-2"><NeonIcon icon={LoaderCircle}/><h3 className={classes.accent}>{s("loading.title")}</h3></div><p>{s("loading.desc")}</p></NeonCard>
          <NeonCard><div className="flex items-center gap-2"><NeonIcon icon={Ban}/><h3 className={classes.accent}>{s("empty.title")}</h3></div><p>{s("empty.desc")}</p></NeonCard>
          <NeonCard><div className="flex items-center gap-2"><NeonIcon icon={TriangleAlert}/><h3 className={classes.accent}>{s("error.title")}</h3></div><p className={classes.warning}>{s("error.desc")}</p></NeonCard>
          <NeonCard><div className="flex items-center gap-2"><NeonIcon icon={Zap}/><h3 className={classes.accent}>{s("degraded.title")}</h3></div><p>{s("degraded.desc")}</p></NeonCard>
        </div>
        <div className="mt-4"><NeonButton>{n("play")}</NeonButton></div>
      </NeonCard>
    </div>
  );
}
