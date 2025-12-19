import * as PIXI from "pixi.js";
import { BoardRenderer } from "./BoardRenderer";
import { SoundManager } from "../../lib/audio/SoundManager";

export class InputController {
  private board: BoardRenderer;
  private selected: { x: number; y: number } | null = null;
  private hasInitedAudio = false;

  constructor(board: BoardRenderer) {
    this.board = board;
  }

  attach(
    stage: PIXI.Container,
    onIntent: (intent: { kind: "swap"; a: { x: number; y: number }; b: { x: number; y: number } } | null) => void
  ) {
    stage.eventMode = "static";
    stage.on("pointerdown", (e: any) => {
      if (!this.hasInitedAudio) {
        try {
          SoundManager.get().initOnFirstGesture();
        } catch {}
        this.hasInitedAudio = true;
      }
      const local = e.getLocalPosition(this.board.root);
      const hit = this.board.hitTest(local.x, local.y);
      if (!hit) return;
      if (!this.selected) {
        this.selected = hit;
        onIntent(null);
        return;
      }
      const a = this.selected;
      const b = hit;
      const isAdj = Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
      this.selected = null;
      if (!isAdj) {
        SoundManager.get().playSfx("SFX_INVALID_SWAP");
        onIntent(null);
        return;
      }
      onIntent({ kind: "swap", a, b });
    });
  }

  getSelected() {
    return this.selected;
  }
  clearSelected() {
    this.selected = null;
  }
}
