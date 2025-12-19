"use client";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");
  return (
    <footer className="border-t border-[var(--neon-cyan)] bg-[color:var(--neon-bg)/0.6]">
      <div className="mx-auto max-w-6xl px-4 py-6 text-sm opacity-80">
        {t("copy")}
      </div>
    </footer>
  );
}
