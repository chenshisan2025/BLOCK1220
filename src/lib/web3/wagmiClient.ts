import { createConfig, http } from "wagmi";
import { SUPPORTED_CHAINS, EXPECTED_CHAIN } from "./chains";

export const wagmiConfig = createConfig({
  chains: [EXPECTED_CHAIN],
  connectors: [],
  transports: {
    56: http(),
    97: http(),
  },
  ssr: false,
});
