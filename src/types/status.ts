export interface RootRef {
  rootType: string;
  periodId: string;
  rootHash: string;
  txHash: string;
  ts: number;
  explorerUrl: string;
}

export interface ServiceStatus {
  status: "operational" | "degraded" | "outage";
  latencyMs?: number;
  lagBlocks?: number;
  message?: string;
  backlog?: number;
  note?: string;
}

export interface StatusResponse {
  locale: "zh" | "en";
  serverNow: number;
  overall: {
    status: "operational" | "degraded" | "outage";
    message: string;
  };
  services: {
    gameApi: { status: ServiceStatus["status"]; latencyMs: number };
    economyApi: { status: ServiceStatus["status"]; latencyMs: number };
    indexer: { status: ServiceStatus["status"]; lagBlocks: number; message?: string };
    rpc: { status: ServiceStatus["status"]; message?: string };
    queue: { status: ServiceStatus["status"]; backlog: number };
  };
  settlements: {
    dailyRank: { status: ServiceStatus["status"]; note: string };
    boxEpoch: { status: ServiceStatus["status"]; note: string };
  };
  lastRoots: RootRef[];
  contracts: {
    rewardDistributor: string;
    vestingVault: string;
    sponsorVault: string;
    treasury: string;
  };
  incidents: Array<{
    id: string;
    status: ServiceStatus["status"];
    message: string;
    ts: number;
  }>;
}
