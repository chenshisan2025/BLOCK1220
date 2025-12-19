import type { LevelConfig, StoryLevelsFile } from "./levelTypes";
import levelsJson from "../../content/story/story_levels_v1.json";

let cache: Map<number, LevelConfig> | null = null;

export function loadStoryLevels(): Map<number, LevelConfig> {
  if (cache) return cache;
  const file = levelsJson as unknown as StoryLevelsFile;
  const m = new Map<number, LevelConfig>();
  for (const lv of file.levels || []) {
    m.set(lv.levelId, lv);
  }
  cache = m;
  return m;
}

export function getLevel(levelId: number): LevelConfig {
  const m = loadStoryLevels();
  const lv = m.get(levelId);
  if (!lv) throw new Error(`LevelConfig not found: ${levelId}`);
  return lv;
}

export function getChapterLevels(chapter: number): LevelConfig[] {
  const m = loadStoryLevels();
  return Array.from(m.values()).filter((x) => x.chapter === chapter);
}
