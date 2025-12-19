export interface TokenInfo {
  symbol: string;
  decimals: number;
}

export interface PoolInfo {
  token: TokenInfo;
  contributionWei: string;
  topUpWei: string;
  rolloverCarryWei?: string;
  totalWei: string;
  minDailyRankPoolWei?: string;
}

export interface BoxEpoch {
  epochId: string;
  countdownSeconds: number;
  participants: {
    boxes: number;
    uniquePlayers: number;
  };
  rolloverStatus: {
    willRollover: boolean;
    reason?: string;
    thresholds: {
      minBoxes: number;
      minUniquePlayers: number;
    };
  };
  pool: PoolInfo;
}

export interface DailyRank {
  dayId: string;
  settleCountdownSeconds: number;
  pool: PoolInfo;
}

export interface RootRef {
  rootType: string;
  periodId: string;
  rootHash: string;
  txHash: string;
  ts: number;
  explorerUrl: string;
}

export interface IndexerStatus {
  status: "operational" | "degraded" | "outage";
  lagBlocks: number;
  message?: string;
}

export interface LiveStatsResponse {
  locale: "zh" | "en";
  chainId: number;
  serverNow: number;
  boxEpoch: BoxEpoch;
  dailyRank: DailyRank;
  lastRoots: RootRef[];
  indexer: IndexerStatus;
}
