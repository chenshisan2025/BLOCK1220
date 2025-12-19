import type { EventCampaign } from "./eventTypes";

export type EventProgress = { eventId: string; current: number; required: number; completed: boolean };

export type EventSignals = {
  collected?: Record<number, number>;
  specialConsumed?: Partial<Record<"Line" | "Bomb" | "Color", number>>;
  runCompleted?: { mode: "story" | "endless"; count: number };
};

export function computeProgress(campaigns: EventCampaign[], signals: EventSignals, mode: "story" | "endless"): EventProgress[] {
  const out: EventProgress[] = [];
  for (const c of campaigns) {
    if (c.type === "CollectEvent") {
      if (c.rules.onlyStory && mode !== "story") continue;
      const cur = signals.collected?.[c.rules.targetType] ?? 0;
      out.push({ eventId: c.eventId, current: cur, required: c.rules.requiredCount, completed: cur >= c.rules.requiredCount });
    }
    if (c.type === "ClearSpecialEvent") {
      if (c.rules.mode !== mode) continue;
      const cur = signals.specialConsumed?.[c.rules.specialType] ?? 0;
      out.push({ eventId: c.eventId, current: cur, required: c.rules.requiredCount, completed: cur >= c.rules.requiredCount });
    }
    if (c.type === "PlayStreakEvent") {
      if (c.rules.mode !== mode) continue;
      const cur = signals.runCompleted?.count ?? 0;
      out.push({ eventId: c.eventId, current: cur, required: c.rules.requiredRuns, completed: cur >= c.rules.requiredRuns });
    }
  }
  return out;
}
