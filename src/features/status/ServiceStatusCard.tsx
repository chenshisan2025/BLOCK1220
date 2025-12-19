import { NeonCard } from "../../components/ui/NeonCard";
import { NeonIcon } from "../../components/ui/NeonIcon";
import { ActivitySquare } from "lucide-react";
import { classes } from "../../design/tokens";
import type { StatusResponse } from "../../lib/validators/status";

type Service = StatusResponse["services"][keyof StatusResponse["services"]];

function statusColor(status: string) {
  if (status === "operational") return classes.accent;
  if (status === "degraded") return classes.warning;
  return "";
}

export function ServiceStatusCard({ title, svc }: { title: string; svc: Service }) {
  return (
    <NeonCard>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <NeonIcon icon={ActivitySquare} />
          <h4 className={classes.accent}>{title}</h4>
        </div>
        <span className={`${statusColor(String(svc.status))}`}>{String(svc.status)}</span>
      </div>
      {svc.message ? <p className="opacity-80 mt-1">{svc.message}</p> : null}
      <div className="grid grid-cols-2 gap-2 mt-2">
        {"latencyMs" in svc && svc.latencyMs !== undefined ? (
          <div className="font-mono">latency {svc.latencyMs}ms</div>
        ) : null}
        {"lagBlocks" in svc && svc.lagBlocks !== undefined ? (
          <div className="font-mono">lag {svc.lagBlocks} blocks</div>
        ) : null}
        {"backlog" in svc && svc.backlog !== undefined ? (
          <div className="font-mono">backlog {svc.backlog}</div>
        ) : null}
      </div>
    </NeonCard>
  );
}
