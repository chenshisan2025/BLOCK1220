export enum CellType {
  Normal = "Normal",
  Special = "Special",
}

export enum SpecialType {
  Line = "Line",
  Bomb = "Bomb",
  Color = "Color",
}

export interface Cell {
  id: string;
  type: CellType;
  color: number;
  special?: SpecialType;
}

export type Board = Cell[][];

export interface Pos {
  x: number;
  y: number;
}

export type MatchKind = "normal" | "line4" | "tOrL5" | "straight5";

export interface Match {
  cells: Pos[];
  kind: MatchKind;
  orientation?: "horizontal" | "vertical";
}

export interface GameConfig {
  width: number;
  height: number;
  colors: number;
  seed?: number;
}

export interface BoardFlags {
  blackholeCells: Set<number>;
  frozenCells?: Set<number>;
}

export interface GameState {
  board: Board;
  score: number;
  timeLeft: number;
  combo: number;
  config: GameConfig;
  flags: BoardFlags;
}
