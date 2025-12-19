"use client";

import { useAccount } from "wagmi";
import { useTranslations } from "next-intl";
import { NeonCard } from "../../components/ui/NeonCard";
import ClaimCard from "./ClaimCard";
import ClaimBatchBar from "./ClaimBatchBar";
import { useClaimables } from "./useClaimables";
import { useClaimMachine } from "./useClaimMachine";

export default function ClaimCenter() {
  const t = useTranslations("claim");
  const { address, isConnected } = useAccount();
  const { data, loading, error, reload } = useClaimables(address);
  const { machine, dispatch } = useClaimMachine();

  if (!isConnected) {
    return <NeonCard><h3 className="text-[var(--neon-cyan)]">{t("title")}</h3><p>{t("connectFirst")}</p></NeonCard>;
  }

  if (loading) {
    if (machine.state !== "LOADING") dispatch({ type: "SET_LOADING" });
  } else if (error) {
    if (machine.state !== "ERROR") dispatch({ type: "SET_ERROR", error });
  } else if (data && data.claims.length > 0) {
    if (machine.state !== "READY" && machine.state !== "SUCCESS") dispatch({ type: "SET_READY" });
  } else {
    if (machine.state !== "EMPTY") dispatch({ type: "SET_EMPTY" });
  }

  const views = {
    LOADING: <NeonCard><h3 className="text-[var(--neon-cyan)]">{t("title")}</h3><p>Loading...</p></NeonCard>,
    ERROR: <NeonCard><h3 className="text-[var(--neon-cyan)]">{t("title")}</h3><p>{t("error")}</p><p className="mt-2 opacity-80">{error}</p></NeonCard>,
    EMPTY: <NeonCard><h3 className="text-[var(--neon-cyan)]">{t("title")}</h3><p>{t("empty")}</p></NeonCard>,
    SUCCESS: <NeonCard><h3 className="text-[var(--neon-cyan)]">{t("title")}</h3><p>{t("success")}</p></NeonCard>,
  } as const;

  if (machine.state !== "READY" && machine.state !== "CLAIMING") {
    const body = views[machine.state as keyof typeof views] || views.LOADING;
    return body;
  }

  return (
    <div className="space-y-4">
      {data?.claims.map((c, i) => (
        <ClaimCard key={i} claim={c} />
      ))}
      <ClaimBatchBar
        claims={data?.claims || []}
        onStart={() => dispatch({ type: "START_CLAIM" })}
        onSuccess={() => {
          dispatch({ type: "CLAIM_SUCCESS" });
          reload();
        }}
        onError={(msg) => dispatch({ type: "CLAIM_ERROR", error: msg })}
      />
    </div>
  );
}
