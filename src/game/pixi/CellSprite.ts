import * as PIXI from "pixi.js";
import { getTileLabel } from "./assets";
import { getTileFill, BORDER_COLOR, PIXI_COLOR_TEXT, PIXI_COLOR_CYAN, PIXI_COLOR_PURPLE, PIXI_COLOR_YELLOW } from "./theme";

export class CellSprite extends PIXI.Container {
  public idKey: string;
  private size: number;
  private bg: PIXI.Graphics;
  private textLabel: PIXI.Text;
  private selectedBorder: PIXI.Graphics;
  private specialOverlay: PIXI.Container;
  private statusOverlay: PIXI.Container;

  constructor(idKey: string, size: number, colorIndex: number) {
    super();
    this.idKey = idKey;
    this.size = size;
    this.bg = new PIXI.Graphics();
    this.addChild(this.bg);
    this.textLabel = new PIXI.Text({
      text: getTileLabel(colorIndex),
      style: new PIXI.TextStyle({
        fill: PIXI_COLOR_TEXT,
        fontSize: Math.floor(size * 0.5),
        fontWeight: "700",
      }),
    });
    this.textLabel.anchor.set(0.5);
    this.addChild(this.textLabel);
    this.selectedBorder = new PIXI.Graphics();
    this.addChild(this.selectedBorder);
    this.specialOverlay = new PIXI.Container();
    this.addChild(this.specialOverlay);
    this.statusOverlay = new PIXI.Container();
    this.addChild(this.statusOverlay);
    this.redraw(size, colorIndex);
  }

  redraw(size: number, colorIndex: number) {
    const r = Math.max(8, Math.floor(size * 0.18));
    const fill = getTileFill(colorIndex);
    this.bg.clear();
    this.bg.roundRect(0, 0, size, size, r).fill(fill);
    this.textLabel.text = getTileLabel(colorIndex);
    this.textLabel.x = size / 2;
    this.textLabel.y = size / 2;
    this.setSelected(false, size);
  }

  setSelected(on: boolean, size: number) {
    this.selectedBorder.clear();
    if (!on) return;
    const r = Math.max(8, Math.floor(size * 0.18));
    this.selectedBorder.roundRect(0, 0, size, size, r).stroke({ color: BORDER_COLOR, width: 3, alpha: 0.9 });
  }

  setSpecial(type?: "Line" | "Bomb" | "Color", size = 64) {
    this.specialOverlay.removeChildren();
    if (!type) return;
    if (type === "Line") {
      const g = new PIXI.Graphics();
      g.roundRect(6, size / 2 - 3, size - 12, 6, 3).fill(PIXI_COLOR_CYAN);
      this.specialOverlay.addChild(g);
    } else if (type === "Bomb") {
      const g = new PIXI.Graphics();
      g.circle(size / 2, size / 2, Math.max(6, Math.floor(size * 0.18))).fill(PIXI_COLOR_YELLOW);
      this.specialOverlay.addChild(g);
    } else if (type === "Color") {
      const ring = new PIXI.Graphics();
      const cx = size / 2;
      const cy = size / 2;
      const r = Math.max(10, Math.floor(size * 0.28));
      ring.circle(cx, cy, r).stroke({ color: PIXI_COLOR_PURPLE, width: 3, alpha: 0.9 });
      const star = new PIXI.Text({
        text: "★",
        style: new PIXI.TextStyle({ fill: PIXI_COLOR_TEXT, fontSize: Math.floor(size * 0.5), fontWeight: "700" }),
      });
      star.anchor.set(0.5);
      star.x = cx;
      star.y = cy;
      this.specialOverlay.addChild(ring, star);
    }
  }

  setState(v: { id: string; colorIndex: number; special?: "Line" | "Bomb" | "Color"; flags?: { frozen?: boolean; blackhole?: boolean } }) {
    this.idKey = v.id;
    this.redraw(this.size ?? 64, v.colorIndex);
    this.setSpecial(v.special, this.size ?? 64);
    this.setFrozen(Boolean(v.flags?.frozen));
    this.setBlackhole(Boolean(v.flags?.blackhole));
  }

  setFrozen(on: boolean) {
    this.statusOverlay.removeChildren();
    if (!on) return;
    const g = new PIXI.Graphics();
    const pad = Math.floor(this.size * 0.14);
    g.roundRect(pad, pad, this.size - pad * 2, this.size - pad * 2, 8).stroke({ color: PIXI_COLOR_CYAN, width: 3, alpha: 0.7 });
    const t = new PIXI.Text({ text: "FROZEN", style: new PIXI.TextStyle({ fill: PIXI_COLOR_TEXT, fontSize: Math.floor(this.size * 0.22), fontWeight: "800" }) });
    t.anchor.set(0.5);
    t.x = this.size / 2;
    t.y = this.size / 2;
    this.statusOverlay.addChild(g, t);
  }

  setBlackhole(on: boolean) {
    this.statusOverlay.removeChildren();
    if (!on) return;
    const g = new PIXI.Graphics();
    const mid = this.size / 2;
    const r = Math.floor(this.size * 0.28);
    g.circle(mid, mid, r).stroke({ color: PIXI_COLOR_PURPLE, width: 4, alpha: 0.8 });
    const t = new PIXI.Text({ text: "BLACKHOLE", style: new PIXI.TextStyle({ fill: PIXI_COLOR_TEXT, fontSize: Math.floor(this.size * 0.2), fontWeight: "800" }) });
    t.anchor.set(0.5);
    t.x = mid;
    t.y = mid;
    this.statusOverlay.addChild(g, t);
  }
}
