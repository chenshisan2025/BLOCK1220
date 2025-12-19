"use client";
import { NeonCard } from "../../../src/components/ui/NeonCard";
import { NeonIcon } from "../../../src/components/ui/NeonIcon";
import { ActivitySquare, LoaderCircle, Ban, TriangleAlert, Zap } from "lucide-react";
import { classes } from "../../../src/design/tokens";
import { useTranslations } from "next-intl";
import StatusCenter from "../../../src/features/status/StatusCenter";

export default function ZhStatus() {
  const t = useTranslations("status");
  const s = useTranslations("states");
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <NeonCard>
        <div className="flex items-center gap-2">
          <NeonIcon icon={ActivitySquare} />
          <h1 className={classes.accent}>{t("title")}</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          <NeonCard><h3 className={classes.accent}>{t("operational")}</h3><p>OK</p></NeonCard>
          <NeonCard><h3 className={classes.accent}>{t("degraded")}</h3><p>{t("humanExplain.indexerDegraded")}</p></NeonCard>
          <NeonCard><h3 className={classes.accent}>{t("outage")}</h3><p>{t("humanExplain.rpcIssue")}</p></NeonCard>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <NeonCard><div className="flex items-center gap-2"><NeonIcon icon={LoaderCircle}/><h3 className={classes.accent}>{s("loading.title")}</h3></div><p>{s("loading.desc")}</p></NeonCard>
          <NeonCard><div className="flex items-center gap-2"><NeonIcon icon={Ban}/><h3 className={classes.accent}>{s("empty.title")}</h3></div><p>{s("empty.desc")}</p></NeonCard>
          <NeonCard><div className="flex items-center gap-2"><NeonIcon icon={TriangleAlert}/><h3 className={classes.accent}>{s("error.title")}</h3></div><p className={classes.warning}>{s("error.desc")}</p></NeonCard>
          <NeonCard><div className="flex items-center gap-2"><NeonIcon icon={Zap}/><h3 className={classes.accent}>{s("degraded.title")}</h3></div><p>{s("degraded.desc")}</p></NeonCard>
        </div>
      </NeonCard>
      <StatusCenter />
    </div>
  );
}
