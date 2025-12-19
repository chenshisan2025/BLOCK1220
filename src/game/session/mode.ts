export type GameMode = "story" | "endless";

export const STORY_MODE = {
  limitSeconds: 60,
  reviveAddSeconds: 30,
  reviveMax: 3,
  goal: { type: "Score", targetScore: 8000 },
} as const;

export const ENDLESS_MODE = {
  limitSeconds: 60,
  reviveAddSeconds: 30,
  reviveMax: 5,
  rankScoreEnabled: true,
} as const;

