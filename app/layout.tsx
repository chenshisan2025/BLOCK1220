import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "BLOCK WORLD",
  description: "Minimal scaffold",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
