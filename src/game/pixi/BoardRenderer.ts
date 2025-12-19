import * as PIXI from "pixi.js";
import { CellSprite } from "./CellSprite";

type EngineCell = { id: string; color: number; special?: any };
type EngineState = { board: EngineCell[][] };

export class BoardRenderer {
  public root: PIXI.Container;
  private cellSize: number;
  private gap: number;
  private sprites: Map<string, CellSprite>;
  private width: number;
  private height: number;
  private lastGridPosById: Map<string, { x: number; y: number }> = new Map();
  private lastPixelPosById: Map<string, { px: number; py: number }> = new Map();

  constructor(width: number, height: number, cellSize = 64, gap = 8) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    this.gap = gap;
    this.root = new PIXI.Container();
    this.sprites = new Map();
  }

  render(state: EngineState, selectedId?: string | null) {
    const board = state.board;
    const present = new Set<string>();
    // cache ensures we can query ids later
    (this as any)._lastState = state;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const cell = board[y][x];
        present.add(cell.id);
        let sp = this.sprites.get(cell.id);
        if (!sp) {
          sp = new CellSprite(cell.id, this.cellSize, cell.color);
          this.sprites.set(cell.id, sp);
          this.root.addChild(sp);
        } else {
          sp.setState({ id: cell.id, colorIndex: cell.color, special: cell.special });
        }
        const pos = this.gridToPixel(x, y);
        sp.x = pos.x;
        sp.y = pos.y;
        this.lastGridPosById.set(cell.id, { x, y });
        this.lastPixelPosById.set(cell.id, { px: sp.x, py: sp.y });
        sp.setSelected(selectedId === cell.id, this.cellSize);
      }
    }
    for (const [id, sp] of this.sprites.entries()) {
      if (!present.has(id)) {
        sp.destroy({ children: true });
        this.sprites.delete(id);
      }
    }
  }

  hitTest(localX: number, localY: number) {
    const step = this.cellSize + this.gap;
    const x = Math.floor(localX / step);
    const y = Math.floor(localY / step);
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return null;
    return { x, y };
  }

  /** 查询 sprite by cellId（供动画） */
  getSpriteById(cellId: string) {
    return this.sprites.get(cellId);
  }

  /** 通过格子坐标拿到 cellId（依赖最近一次 render 的 state） */
  getCellIdAt(state: any, x: number, y: number): string | null {
    const row = state?.board?.[y];
    const cell = row?.[x];
    return cell?.id ?? null;
  }

  /** 网格坐标转像素坐标 */
  gridToPixel(x: number, y: number) {
    const step = this.cellSize + this.gap;
    return { x: x * step, y: y * step };
  }

  getLastGridPositions() {
    return this.lastGridPosById;
  }

  getLastPixelPositions() {
    return this.lastPixelPosById;
  }

  getCellSize() {
    return this.cellSize;
  }

  getGap() {
    return this.gap;
  }
}
