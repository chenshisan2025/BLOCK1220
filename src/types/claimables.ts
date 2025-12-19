export interface TokenInfo {
  symbol: string;
  decimals: number;
}

export interface RootRef {
  rootHash: string;
  txHash: string;
  ts: number;
  explorerUrl: string;
}

export interface VestingInfo {
  startTs: number;
  cliffSeconds: number;
  durationSeconds: number;
  immediateUnlockBps: number;
}

export interface ClaimItem {
  rootType: string;
  periodId: string;
  periodKey: string;
  token: TokenInfo;
  amountWei: string;
  proof: string[];
  isClaimed: boolean;
  isVesting: boolean;
  vesting?: VestingInfo;
  meta: {
    title: string;
    subtitle: string;
  };
  rootRef?: RootRef;
}

export interface ClaimablesResponse {
  locale: "zh" | "en";
  chainId: number;
  serverNow: number;
  address: string;
  contracts: {
    rewardDistributor: string;
    vestingVault?: string;
  };
  notices: string[];
  claims: ClaimItem[];
}
