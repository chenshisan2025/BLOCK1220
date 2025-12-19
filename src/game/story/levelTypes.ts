export type LevelGoal =
  | { type: "Score"; targetScore: number }
  | { type: "Collect"; targetType: number; count: number };

export type LevelConfig = {
  levelId: number;
  chapter: number;
  mode: "story";
  gridSize: number;
  colorsCount: number;
  goal: LevelGoal;
  bossProfileId: string;
  seedRules: number;
};

export type StoryLevelsFile = {
  version: string;
  levels: LevelConfig[];
};
