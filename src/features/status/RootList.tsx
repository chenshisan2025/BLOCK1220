import { NeonCard } from "../../components/ui/NeonCard";
import { NeonButton } from "../../components/ui/NeonButton";
import type { StatusResponse } from "../../lib/validators/status";

function truncateHash(h: string) {
  if (!h || h.length < 12) return h;
  return `${h.slice(0, 6)}...${h.slice(-4)}`;
}

export function RootList({ roots }: { roots: StatusResponse["lastRoots"] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {roots.slice(0, 3).map((r, i) => (
        <NeonCard key={i}>
          <p className="font-mono">{truncateHash(r.rootHash)}</p>
          <p className="opacity-80">[{r.rootType}] {r.periodId}</p>
          {r.txHash ? <p className="font-mono opacity-70">tx {truncateHash(r.txHash)}</p> : null}
          {r.explorerUrl ? (
            <div className="mt-2">
              <a href={r.explorerUrl} target="_blank" rel="noreferrer">
                <NeonButton>View</NeonButton>
              </a>
            </div>
          ) : null}
        </NeonCard>
      ))}
    </div>
  );
}
