export type RunResult = {
  mode: "endless";
  address: string;
  rawScore: number;
  effectiveTimeSec: number;
  rankScore: number;
  timestamp: number;
  telemetry?: {
    revivesUsed: number;
    swapsTotal: number;
    swapsValid: number;
    cascadesTotal: number;
    specialsTotal: number;
    specialsLine: number;
    specialsBomb: number;
    specialsColor: number;
  };
};
