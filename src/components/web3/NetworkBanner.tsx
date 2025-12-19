"use client";

import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { EXPECTED_CHAIN_ID } from "../../lib/web3/chains";
import { useTranslations } from "next-intl";
import { NeonCard } from "../ui/NeonCard";
import { NeonButton } from "../ui/NeonButton";
import { NeonIcon } from "../ui/NeonIcon";
import { TriangleAlert } from "lucide-react";

export default function NetworkBanner() {
  const t = useTranslations("web3");
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending, error } = useSwitchChain();

  if (!isConnected) return null;
  if (chainId === EXPECTED_CHAIN_ID) return null;

  return (
    <NeonCard>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[var(--neon-cyan)]">{t("wrongNetworkTitle")}</h3>
          <p className="opacity-80">{t("wrongNetworkDesc")}</p>
        </div>
        <NeonIcon icon={TriangleAlert} />
      </div>
      <div className="flex items-center gap-3 mt-3">
        <NeonButton onClick={() => switchChain({ chainId: EXPECTED_CHAIN_ID })} disabled={isPending}>
          {t("switchNetwork")}
        </NeonButton>
        {error && <div className="text-xs opacity-80">{t("switchFailed")}</div>}
      </div>
    </NeonCard>
  );
}
