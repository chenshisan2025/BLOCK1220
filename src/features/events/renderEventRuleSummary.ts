import type { TFunction } from "next-intl";

export function renderEventRuleSummary(
  event: { type: "CollectEvent" | "ClearSpecialEvent" | "PlayStreakEvent"; rules: any },
  t: TFunction
): string {
  const { type, rules } = event;
  if (type === "CollectEvent") {
    const count = rules.requiredCount;
    const itemKey = `eventItem.type_${rules.targetType}`;
    const item = t(itemKey as any);
    const modeKey = rules.onlyStory ? "eventRule.collect.story" : "eventRule.collect.any";
    return t(modeKey as any, { count, item } as any) as any;
  }
  if (type === "ClearSpecialEvent") {
    const count = rules.requiredCount;
    const special = t(`eventSpecial.${rules.specialType}` as any);
    const modeKey = rules.mode === "endless" ? "eventRule.clearSpecial.endless" : "eventRule.clearSpecial.any";
    return t(modeKey as any, { count, special } as any) as any;
  }
  if (type === "PlayStreakEvent") {
    const count = rules.requiredRuns;
    const modeKey =
      rules.mode === "story"
        ? "eventRule.playStreak.story"
        : rules.mode === "endless"
        ? "eventRule.playStreak.endless"
        : "eventRule.playStreak.any";
    return t(modeKey as any, { count } as any) as any;
  }
  return "";
}
