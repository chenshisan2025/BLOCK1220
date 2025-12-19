import { NeonCard } from "../../components/ui/NeonCard";
import { classes } from "../../design/tokens";
import type { StatusResponse } from "../../lib/validators/status";

export function SettlementStatusCard({ settlements }: { settlements: StatusResponse["settlements"] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <NeonCard>
        <h4 className={classes.accent}>Daily Rank Settlement</h4>
        <p className="opacity-80">{String(settlements.dailyRank.status)}</p>
        <p className="mt-1">{settlements.dailyRank.note}</p>
      </NeonCard>
      <NeonCard>
        <h4 className={classes.accent}>Box Epoch Settlement</h4>
        <p className="opacity-80">{String(settlements.boxEpoch.status)}</p>
        <p className="mt-1">{settlements.boxEpoch.note}</p>
      </NeonCard>
    </div>
  );
}
