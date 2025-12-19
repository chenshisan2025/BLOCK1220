"use client";

import { useEffect, useMemo, useState } from "react";
import { NeonButton } from "../../components/ui/NeonButton";
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

export default function ClaimBatchBar({
  claims,
  onStart,
  onSuccess,
  onError,
}: {
  claims: ClaimItem[];
  onStart: () => void;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const [claiming, setClaiming] = useState(false);
  const claimable = useMemo(() => claims.filter((c) => !c.isClaimed), [claims]);
  const totalFly = useMemo(() => {
    const tokenDecimals = (sym: string) => (sym === "FLY" || sym === "sFLY" ? 18 : 18);
    const sum = claimable.reduce((acc, c) => acc + Number(formatWei(c.amountWei, tokenDecimals(c.token.symbol))), 0);
    return sum.toFixed(4);
  }, [claimable]);
  const lockedSfly = useMemo(() => {
    const s = claims.filter((c) => c.token.symbol === "sFLY");
    const sum = s.reduce((acc, c) => acc + Number(formatWei(c.amountWei, c.token.decimals)), 0);
    return sum.toFixed(4);
  }, [claims]);

  useEffect(() => {
    if (claims.length === 0) setClaiming(false);
  }, [claims.length]);

  return (
    <div className="sticky bottom-0 p-4 bg-[color:var(--neon-bg)/0.8] border-t border-[var(--neon-cyan)]">
      <div className="mx-auto max-w-5xl flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="font-mono">Total: {totalFly} FLY</div>
          <div className="font-mono">Locked: {lockedSfly} sFLY</div>
        </div>
        <NeonButton
          disabled={claimable.length === 0 || claiming}
          onClick={() => {
            try {
              onStart();
              setClaiming(true);
              setTimeout(() => {
                setClaiming(false);
                onSuccess();
              }, 1400);
            } catch (e: any) {
              setClaiming(false);
              onError(e?.message || "Claim failed");
            }
          }}
        >
          {claiming ? "Claiming..." : "Claim All (Mock)"}
        </NeonButton>
      </div>
    </div>
  );
}
