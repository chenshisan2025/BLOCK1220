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
export function evaluateRisk(t: Telemetry): RiskResult {
  const reasons: RiskReason[] = [];
  let score = 0;
  const swapsRate = t.effectiveTimeSec > 0 ? t.swapsTotal / t.effectiveTimeSec : 0;
  const validRatio = t.swapsTotal > 0 ? t.swapsValid / t.swapsTotal : 0;
  const specialRate = t.swapsTotal > 0 ? t.specialsTotal / t.swapsTotal : 0;
  if (t.rankScore >= 20000) {
    score += 30;
    reasons.push({ code: "RANKSCORE_TOO_HIGH", weight: 30, detail: { rankScore: t.rankScore } });
  }
  if (swapsRate > 2.2 && t.swapsTotal > 60) {
    score += 20;
    reasons.push({ code: "SWAPS_RATE_TOO_HIGH", weight: 20, detail: { swapsRate } });
  }
  if (validRatio > 0.98 && t.swapsTotal > 80) {
    score += 15;
    reasons.push({ code: "VALID_SWAP_RATIO_TOO_HIGH", weight: 15, detail: { validRatio } });
  }
  if (specialRate > 0.35 && t.swapsTotal > 50) {
    score += 15;
    reasons.push({ code: "SPECIAL_RATE_ANOMALY", weight: 15, detail: { specialRate } });
  }
  if (t.specialsColor >= 6) {
    score += 20;
    reasons.push({ code: "COLOR_SPECIAL_SPIKE", weight: 20, detail: { specialsColor: t.specialsColor } });
  }
  score = Math.max(0, Math.min(100, score));
  let decision: RiskDecision = "allow";
  if (score >= 85) decision = "deny";
  else if (score >= 70) decision = "review";
  else if (score >= 40) decision = "shadow";
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
