"use client";
import Link from "next/link";
import { NeonButton } from "../ui/NeonButton";
import { NeonIcon } from "../ui/NeonIcon";
import { Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import WalletButton from "../web3/WalletButton";

export function HeaderNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const currentLocale = pathname?.startsWith("/en") ? "en" : "zh";
  const otherLocale = currentLocale === "zh" ? "en" : "zh";
  const rest = (pathname || "").replace(/^\/(en|zh)/, "");
  const switchHref = `/${otherLocale}${rest || ""}`;
  const base = `/${currentLocale}`;
  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-[var(--neon-bg)] border-b border-[var(--neon-cyan)]">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <NeonIcon icon={Zap} />
          <span className="font-semibold">{t("logo")}</span>
          <span className="text-xs opacity-70 border border-[var(--neon-cyan)] px-1 py-0.5 rounded">{currentLocale.toUpperCase()}</span>
        </div>
        <nav className="hidden md:flex items-center gap-4">
          <Link href={`${base}`} className="hover:underline">{t("home")}</Link>
          <Link href={`${base}/play`} className="hover:underline">{t("play")}</Link>
          <Link href={`${base}/claim`} className="hover:underline">{t("claim")}</Link>
          <Link href={`${base}/leaderboard`} className="hover:underline">{t("leaderboard")}</Link>
          <Link href={`${base}/events`} className="hover:underline">{t("events")}</Link>
          <Link href={`${base}/sponsors`} className="hover:underline">{t("sponsors")}</Link>
          <Link href={`${base}/docs`} className="hover:underline">{t("docs")}</Link>
          <Link href={`${base}/status`} className="hover:underline">{t("status")}</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href={switchHref}>
            <NeonButton>{currentLocale === "zh" ? t("langEn") : t("langZh")}</NeonButton>
          </Link>
          <WalletButton />
          <Link href="/admin" className="underline">{t("admin")}</Link>
        </div>
      </div>
      <div className="md:hidden px-4 pb-3 flex flex-wrap gap-3">
        <Link href={`${base}`} className="underline">{t("home")}</Link>
        <Link href={`${base}/play`} className="underline">{t("play")}</Link>
        <Link href={`${base}/claim`} className="underline">{t("claim")}</Link>
        <Link href={`${base}/leaderboard`} className="underline">{t("leaderboard")}</Link>
        <Link href={`${base}/events`} className="underline">{t("events")}</Link>
        <Link href={`${base}/sponsors`} className="underline">{t("sponsors")}</Link>
        <Link href={`${base}/docs`} className="underline">{t("docs")}</Link>
        <Link href={`${base}/status`} className="underline">{t("status")}</Link>
      </div>
    </header>
  );
}
