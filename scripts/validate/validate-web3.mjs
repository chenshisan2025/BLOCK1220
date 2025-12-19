import { exists, read, fail, ok } from "./_util.mjs";

const requiredFiles = [
  "src/lib/web3/chains.ts",
  "src/lib/web3/wagmiClient.ts",
  "src/lib/web3/Web3Provider.tsx",
  "src/lib/web3/shortAddress.ts",
  "src/components/web3/WalletButton.tsx",
  "src/components/web3/NetworkBanner.tsx",
];

const missing = requiredFiles.filter((p) => !exists(p));
if (missing.length) {
  console.error("Missing Web3 required files:");
  missing.forEach((m) => console.error(" - " + m));
  fail("validate-web3 failed (missing required web3 files).");
}

const headerPath = "src/components/layout/HeaderNav.tsx";
if (!exists(headerPath)) fail("HeaderNav.tsx not found");
const header = read(headerPath);
const headerOk =
  header.includes("WalletButton") &&
  (header.includes("<WalletButton") || header.includes("WalletButton("));
if (!headerOk) {
  fail("HeaderNav.tsx does not import/use WalletButton. You must render <WalletButton /> in the header.");
}

const candidatePages = [
  "app/zh/page.tsx",
  "app/en/page.tsx",
];
let networkBannerReferenced = false;
for (const p of candidatePages) {
  if (!exists(p)) continue;
  const s = read(p);
  if (s.includes("NetworkBanner") && (s.includes("<NetworkBanner") || s.includes("NetworkBanner("))) {
    networkBannerReferenced = true;
    break;
  }
}
if (!networkBannerReferenced) {
  fail("NetworkBanner is not referenced in app/zh/page.tsx or app/en/page.tsx. Add <NetworkBanner /> near the top of the page.");
}

ok("Web3 checks passed (files exist, HeaderNav uses WalletButton, NetworkBanner referenced).");

// ---- Provider wrapping check (Hard Gate) ----
const layoutFiles = [
  "app/zh/layout.tsx",
  "app/en/layout.tsx",
];

for (const layoutPath of layoutFiles) {
  if (!exists(layoutPath)) {
    fail(`Missing ${layoutPath}. Web3Provider must wrap this layout.`);
  }
  const content = read(layoutPath);
  const hasProviderImport =
    content.includes("Web3Provider") &&
    content.includes("from") &&
    content.includes("Web3Provider");
  const hasProviderUsage =
    content.includes("<Web3Provider>") ||
    content.includes("<Web3Provider ");
  if (!hasProviderImport || !hasProviderUsage) {
    fail(
      `${layoutPath} is not wrapped by <Web3Provider>. All wagmi hooks require Web3Provider at the layout level.`
    );
  }
}
ok("Web3Provider wrapping validated for zh/en layouts.");
