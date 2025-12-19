import type { TFunction } from "next-intl";

export type BadgeTone = "cyan" | "purple" | "yellow" | "green" | "red" | "zinc";
export type EventBadge = { label: string; tone: BadgeTone };

export function renderEventBadges(
  event: { type: "CollectEvent" | "ClearSpecialEvent" | "PlayStreakEvent"; rules: any },
  t: TFunction
): EventBadge[] {
  const badges: EventBadge[] = [];
  let modeKey: "story" | "endless" | "any" = "any";
  if (event.type === "CollectEvent") {
    modeKey = event.rules?.onlyStory ? "story" : "any";
  } else if (event.type === "ClearSpecialEvent" || event.type === "PlayStreakEvent") {
    modeKey = event.rules?.mode ?? "any";
  }
  badges.push({ label: t(`eventBadge.mode.${modeKey}` as any) as any, tone: modeKey === "endless" ? "purple" : modeKey === "story" ? "cyan" : "zinc" });
  badges.push({
    label: t(`eventBadge.type.${event.type}` as any) as any,
    tone: event.type === "CollectEvent" ? "cyan" : event.type === "ClearSpecialEvent" ? "purple" : "yellow",
  });
  let n = 0;
  if (event.type === "CollectEvent") n = event.rules?.requiredCount ?? 0;
  if (event.type === "ClearSpecialEvent") n = event.rules?.requiredCount ?? 0;
  if (event.type === "PlayStreakEvent") n = event.rules?.requiredRuns ?? 0;
  if (n > 0) badges.push({ label: (t("eventBadge.unit.count", { n }) as any) as any, tone: "zinc" });
  if (event.type === "ClearSpecialEvent" && event.rules?.specialType) badges.push({ label: String(event.rules.specialType), tone: "purple" });
  if (event.type === "CollectEvent" && typeof event.rules?.targetType === "number") badges.push({ label: `T${event.rules.targetType}`, tone: "cyan" });
  return badges;
}
