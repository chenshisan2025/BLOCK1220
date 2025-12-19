export type EventMode = "story" | "endless" | "any";

export type EventReward = {
  rewardType: "Token";
  symbol: string;
  amountWei: string;
  decimals: number;
};

export type CollectEventRules = {
  targetType: number;
  requiredCount: number;
  onlyStory?: boolean;
};

export type ClearSpecialEventRules = {
  specialType: "Line" | "Bomb" | "Color";
  requiredCount: number;
  mode: "story" | "endless";
};

export type PlayStreakEventRules = {
  requiredRuns: number;
  mode: "story" | "endless";
};

export type EventCampaign =
  | {
      eventId: string;
      titleKey: string;
      descKey: string;
      type: "CollectEvent";
      startAt: string;
      endAt: string;
      rules: CollectEventRules;
      reward: EventReward;
    }
  | {
      eventId: string;
      titleKey: string;
      descKey: string;
      type: "ClearSpecialEvent";
      startAt: string;
      endAt: string;
      rules: ClearSpecialEventRules;
      reward: EventReward;
    }
  | {
      eventId: string;
      titleKey: string;
      descKey: string;
      type: "PlayStreakEvent";
      startAt: string;
      endAt: string;
      rules: PlayStreakEventRules;
      reward: EventReward;
    };

export type EventCampaignFile = {
  version: string;
  campaigns: EventCampaign[];
};
