import { bsc, bscTestnet } from "wagmi/chains";

export const EXPECTED_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || "56");
export const SUPPORTED_CHAINS = EXPECTED_CHAIN_ID === 97 ? [bscTestnet] : [bsc];
export const EXPECTED_CHAIN = SUPPORTED_CHAINS[0];
export const EXPLORER_BASE =
  process.env.NEXT_PUBLIC_EXPLORER_BASE ||
  (EXPECTED_CHAIN_ID === 97 ? "https://testnet.bscscan.com" : "https://bscscan.com");
