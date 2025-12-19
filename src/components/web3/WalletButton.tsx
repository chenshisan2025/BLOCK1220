"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { NeonButton } from "../ui/NeonButton";
import { NeonCard } from "../ui/NeonCard";
import { NeonIcon } from "../ui/NeonIcon";
import { Copy, LogOut, Wallet } from "lucide-react";
import { shortAddress } from "../../lib/web3/shortAddress";

export default function WalletButton() {
  const t = useTranslations("web3");
  const [address, setAddress] = useState<string | null>(null);
  const [isPending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const eth = (window as any).ethereum;
        if (!eth) return;
        const accounts: string[] = await eth.request({ method: "eth_accounts" });
        if (accounts && accounts[0]) setAddress(accounts[0]);
      } catch {}
    }
    init();
  }, []);

  async function copyAddr() {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 900);
  }

  if (!address) {
    return (
      <>
        <div className="flex items-center gap-2">
          <NeonIcon icon={Wallet} />
          <NeonButton onClick={() => setOpen(true)}>{t("connect")}</NeonButton>
        </div>

        {open && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
              <NeonCard>
                <div className="flex items-center justify-between">
                  <h3 className="text-[var(--neon-cyan)]">{t("connect")}</h3>
                  <NeonButton onClick={() => setOpen(false)}>✕</NeonButton>
                </div>
                <div className="space-y-2 mt-3">
                  <NeonButton
                    onClick={async () => {
                      if (isPending) return;
                      setPending(true);
                      setError(null);
                      try {
                        const eth = (window as any).ethereum;
                        if (!eth) throw new Error("No injected provider");
                        const accounts: string[] = await eth.request({ method: "eth_requestAccounts" });
                        if (accounts && accounts[0]) {
                          setAddress(accounts[0]);
                          setOpen(false);
                        }
                      } catch (e: any) {
                        setError(e?.message || "Connect failed");
                      } finally {
                        setPending(false);
                      }
                    }}
                  >
                    MetaMask (Injected)
                  </NeonButton>
                  {error && <div className="text-xs opacity-80 mt-2">{String(error)}</div>}
                </div>
              </NeonCard>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <NeonIcon icon={Copy} />
      <span className="font-mono">{shortAddress(address || undefined)}</span>
      <NeonButton onClick={copyAddr}>{copied ? t("copied") : t("copy")}</NeonButton>

      <NeonIcon icon={LogOut} />
      <NeonButton onClick={() => setAddress(null)}>{t("disconnect")}</NeonButton>
    </div>
  );
}
