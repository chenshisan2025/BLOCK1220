import { NeonCard } from "../../components/ui/NeonCard";
import { NeonIcon } from "../../components/ui/NeonIcon";
import { TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import type { StatusResponse } from "../../lib/validators/status";

export function HumanExplain({ data }: { data: StatusResponse }) {
  const t = useTranslations("status.humanExplain");
  const showsIndexer = String(data.services.indexer.status) === "degraded" || String(data.overall.status) === "degraded";
  const showsRpc = String(data.services.rpc.status) !== "operational";
  const showsSettle =
    String(data.settlements.dailyRank.status) !== "operational" ||
    String(data.settlements.boxEpoch.status) !== "operational";

  return (
    <div className="space-y-3">
      {showsIndexer ? (
        <NeonCard>
          <div className="flex items-center gap-2">
            <NeonIcon icon={TriangleAlert} />
            <h4 className="text-[var(--neon-cyan)]">Info</h4>
          </div>
          <p>{t("indexerDegraded")}</p>
        </NeonCard>
      ) : null}
      {showsRpc ? (
        <NeonCard>
          <div className="flex items-center gap-2">
            <NeonIcon icon={TriangleAlert} />
            <h4 className="text-[var(--neon-cyan)]">Info</h4>
          </div>
          <p>{t("rpcIssue")}</p>
        </NeonCard>
      ) : null}
      {showsSettle ? (
        <NeonCard>
          <div className="flex items-center gap-2">
            <NeonIcon icon={TriangleAlert} />
            <h4 className="text-[var(--neon-cyan)]">Info</h4>
          </div>
          <p>{t("settlementDelay")}</p>
        </NeonCard>
      ) : null}
    </div>
  );
}
