import { NeonCard } from "../../components/ui/NeonCard";
import { NeonIcon } from "../../components/ui/NeonIcon";
import { Lock, CheckCircle2, Clock } from "lucide-react";
import { ClaimablesResponse } from "../../lib/validators/claimables";

function formatWei(wei: string, decimals = 18, precision = 4) {
  try {
    const d = BigInt(decimals);
    const base = BigInt(10) ** d;
    const n = BigInt(wei);
    const intPart = n / base;
    const fracPart = n % base;
    const fracStr = (fracPart * BigInt(10 ** precision) / base).toString().padStart(precision, "0");
    return `${intPart.toString()}.${fracStr}`;
  } catch {
    return "0.0000";
  }
}

type ClaimItem = ClaimablesResponse["claims"][number];

export default function ClaimCard({ claim }: { claim: ClaimItem }) {
  const amount = formatWei(claim.amountWei, claim.token.decimals);
  const statusIcon = claim.isClaimed ? CheckCircle2 : claim.isVesting ? Lock : Clock;
  const statusLabel = claim.isClaimed ? "Claimed" : claim.isVesting ? "Vesting" : "Ready";
  return (
    <NeonCard>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-[var(--neon-cyan)]">{claim.meta?.title || claim.rootType}</h4>
          {claim.meta?.subtitle ? <p className="opacity-80">{claim.meta.subtitle}</p> : null}
          <p className="opacity-70 text-xs">[{claim.rootType}]</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-mono">{amount} {claim.token.symbol}</p>
          </div>
          <div className="flex items-center gap-1">
            <NeonIcon icon={statusIcon} />
            <span className="text-xs opacity-80">{statusLabel}</span>
          </div>
        </div>
      </div>
    </NeonCard>
  );
}
