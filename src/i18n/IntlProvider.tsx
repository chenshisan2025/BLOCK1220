"use client";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";

export function IntlProvider({
  children,
  messages,
  locale,
}: {
  children: ReactNode;
  messages: Record<string, any>;
  locale: string;
}) {
  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}
