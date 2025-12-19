"use client";

import { NeonCard } from "../../components/ui/NeonCard";
import { NeonIcon } from "../../components/ui/NeonIcon";
import { ActivitySquare } from "lucide-react";
import { classes } from "../../design/tokens";
import { useTranslations } from "next-intl";
import { useStatusSummary } from "./useStatusSummary";
import { ServiceStatusCard } from "./ServiceStatusCard";
import { SettlementStatusCard } from "./SettlementStatusCard";
import { RootList } from "./RootList";
import { HumanExplain } from "./HumanExplain";

function statusColor(status: string) {
  if (status === "operational") return classes.accent;
  if (status === "degraded") return classes.warning;
  return "";
}

export default function StatusCenter() {
  const { data, loading, error, reload } = useStatusSummary();
  const t = useTranslations("status");

  if (loading) {
    return (
      <NeonCard>
        <h3 className={classes.accent}>{t("title")}</h3>
        <p>Loading...</p>
      </NeonCard>
    );
  }
  if (error || !data) {
    return (
      <NeonCard>
        <h3 className={classes.accent}>{t("title")}</h3>
        <p className={classes.warning}>{t("humanExplain.rpcIssue")}</p>
      </NeonCard>
    );
  }

  return (
    <div className="space-y-4">
      <NeonCard>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <NeonIcon icon={ActivitySquare} />
            <h4 className={classes.accent}>{t("title")}</h4>
          </div>
          <span className={statusColor(String(data.overall.status))}>{String(data.overall.status)}</span>
        </div>
        <p className="opacity-80 mt-1">{data.overall.message}</p>
      </NeonCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ServiceStatusCard title={t("services.gameApi")} svc={data.services.gameApi} />
        <ServiceStatusCard title={t("services.economyApi")} svc={data.services.economyApi} />
        <ServiceStatusCard title={t("services.indexer")} svc={data.services.indexer} />
        <ServiceStatusCard title={t("services.rpc")} svc={data.services.rpc} />
        <ServiceStatusCard title={t("services.queue")} svc={data.services.queue} />
      </div>

      <SettlementStatusCard settlements={data.settlements} />

      <NeonCard>
        <h4 className={classes.accent}>{t("rootListTitle") ?? "Latest Roots"}</h4>
        <RootList roots={data.lastRoots} />
      </NeonCard>

      <HumanExplain data={data} />
    </div>
  );
}
