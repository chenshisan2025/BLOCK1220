export type RiskReason = { code: string; weight: number; detail?: any };
export type RiskDecision = "allow" | "shadow" | "review" | "deny";
export type Telemetry = {
  runId: string;
  ts: number;
  day: string;
  mode: "story" | "endless";
  levelId?: number | null;
  address: string;
  rawScore: number;
  effectiveTimeSec: number;
  rankScore: number;
  revivesUsed: number;
  swapsTotal: number;
  swapsValid: number;
  cascadesTotal: number;
  specialsTotal: number;
  specialsLine: number;
  specialsBomb: number;
  specialsColor: number;
  bossType?: string | null;
  bossFlags?: any;
  clientMeta?: any;
  serverMeta?: any;
};
export type RiskResult = { riskScore: number; reasons: RiskReason[]; decision: RiskDecision; decisionNote?: string };
export type RiskConfig = {
  gates: { enableRiskGating: boolean; enableShadow: boolean; enableReview: boolean; enableDeny: boolean };
  decisionBands: { shadowMin: number; reviewMin: number; denyMin: number };
  thresholds: { rankScoreHigh: number; swapsRateHigh: number; validSwapRatioHigh: number; specialRateHigh: number; colorSpecialSpike: number };
  weights: {
    RANKSCORE_TOO_HIGH: number;
    SWAPS_RATE_TOO_HIGH: number;
    VALID_SWAP_RATIO_TOO_HIGH: number;
    SPECIAL_RATE_ANOMALY: number;
    COLOR_SPECIAL_SPIKE: number;
  };
};
export function evaluateRisk(t: Telemetry, cfg: RiskConfig): RiskResult {
  const reasons: RiskReason[] = [];
  let score = 0;
  const swapsRate = t.effectiveTimeSec > 0 ? t.swapsTotal / t.effectiveTimeSec : 0;
  const validRatio = t.swapsTotal > 0 ? t.swapsValid / t.swapsTotal : 0;
  const specialRate = t.swapsTotal > 0 ? t.specialsTotal / t.swapsTotal : 0;
  if (t.rankScore >= cfg.thresholds.rankScoreHigh) {
    score += cfg.weights.RANKSCORE_TOO_HIGH;
    reasons.push({ code: "RANKSCORE_TOO_HIGH", weight: cfg.weights.RANKSCORE_TOO_HIGH, detail: { rankScore: t.rankScore } });
  }
  if (swapsRate > cfg.thresholds.swapsRateHigh && t.swapsTotal > 60) {
    score += cfg.weights.SWAPS_RATE_TOO_HIGH;
    reasons.push({ code: "SWAPS_RATE_TOO_HIGH", weight: cfg.weights.SWAPS_RATE_TOO_HIGH, detail: { swapsRate } });
  }
  if (validRatio > cfg.thresholds.validSwapRatioHigh && t.swapsTotal > 80) {
    score += cfg.weights.VALID_SWAP_RATIO_TOO_HIGH;
    reasons.push({ code: "VALID_SWAP_RATIO_TOO_HIGH", weight: cfg.weights.VALID_SWAP_RATIO_TOO_HIGH, detail: { validRatio } });
  }
  if (specialRate > cfg.thresholds.specialRateHigh && t.swapsTotal > 50) {
    score += cfg.weights.SPECIAL_RATE_ANOMALY;
    reasons.push({ code: "SPECIAL_RATE_ANOMALY", weight: cfg.weights.SPECIAL_RATE_ANOMALY, detail: { specialRate } });
  }
  if (t.specialsColor >= cfg.thresholds.colorSpecialSpike) {
    score += cfg.weights.COLOR_SPECIAL_SPIKE;
    reasons.push({ code: "COLOR_SPECIAL_SPIKE", weight: cfg.weights.COLOR_SPECIAL_SPIKE, detail: { specialsColor: t.specialsColor } });
  }
  score = Math.max(0, Math.min(100, score));
  let decision: RiskDecision = "allow";
  if (!cfg.gates.enableRiskGating) decision = "allow";
  else {
    if (cfg.gates.enableDeny && score >= cfg.decisionBands.denyMin) decision = "deny";
    else if (cfg.gates.enableReview && score >= cfg.decisionBands.reviewMin) decision = "review";
    else if (cfg.gates.enableShadow && score >= cfg.decisionBands.shadowMin) decision = "shadow";
  }
  return {
    riskScore: score,
    reasons,
    decision,
    decisionNote:
      decision === "shadow"
        ? "shadow: no leaderboard, no rewards"
        : decision === "review"
        ? "review: delayed rewards pending manual approval"
        : decision === "deny"
        ? "deny: no leaderboard, no rewards"
        : undefined,
  };
}
