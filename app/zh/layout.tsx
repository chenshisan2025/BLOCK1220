import type { ReactNode } from "react";
import { IntlProvider } from "../../src/i18n/IntlProvider";
import { HeaderNav } from "../../src/components/layout/HeaderNav";
import { Footer } from "../../src/components/layout/Footer";
import "../globals.css";
import zh from "../../messages/zh.json";
import Web3Provider from "../../src/lib/web3/Web3Provider";

export default function ZhLayout({ children }: { children: ReactNode }) {
  return (
    <IntlProvider messages={zh} locale="zh">
      <Web3Provider>
        <HeaderNav />
        <main className="min-h-[calc(100vh-160px)] p-4 md:p-6">{children}</main>
        <Footer />
      </Web3Provider>
    </IntlProvider>
  );
}
