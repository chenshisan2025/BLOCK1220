import * as PIXI from "pixi.js";
import { PIXI_COLOR_CYAN, PIXI_COLOR_PURPLE, PIXI_COLOR_TEXT } from "./theme";

type DisplayObj = PIXI.Container & { x: number; y: number };

function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function tweenPosition(
  app: PIXI.Application,
  obj: DisplayObj,
  toX: number,
  toY: number,
  durationMs: number
): Promise<void> {
  const fromX = obj.x;
  const fromY = obj.y;
  const start = performance.now();
  return new Promise((resolve) => {
    const tick = () => {
      const now = performance.now();
      const t = Math.min(1, (now - start) / durationMs);
      const e = easeInOutQuad(t);
      obj.x = fromX + (toX - fromX) * e;
      obj.y = fromY + (toY - fromY) * e;
      if (t >= 1) {
        app.ticker.remove(tick);
        resolve();
      }
    };
    app.ticker.add(tick);
  });
}

function tweenAlphaScale(
  app: PIXI.Application,
  obj: DisplayObj,
  toAlpha: number,
  toScale: number,
  durationMs: number
): Promise<void> {
  const fromAlpha = (obj as any).alpha ?? 1;
  const fromScale = (obj as any).scale?.x ?? 1;
  const start = performance.now();
  return new Promise((resolve) => {
    const tick = () => {
      const now = performance.now();
      const t = Math.min(1, (now - start) / durationMs);
      const e = easeInOutQuad(t);
      const alpha = fromAlpha + (toAlpha - fromAlpha) * e;
      const sc = fromScale + (toScale - fromScale) * e;
      (obj as any).alpha = alpha;
      if ((obj as any).scale) {
        (obj as any).scale.set(sc);
      }
      if (t >= 1) {
        app.ticker.remove(tick);
        resolve();
      }
    };
    app.ticker.add(tick);
  });
}

export async function animateSwap(
  app: PIXI.Application,
  a: DisplayObj,
  b: DisplayObj,
  durationMs = 140
): Promise<void> {
  const ax = a.x, ay = a.y;
  const bx = b.x, by = b.y;
  await Promise.all([
    tweenPosition(app, a, bx, by, durationMs),
    tweenPosition(app, b, ax, ay, durationMs),
  ]);
}

export async function animateSwapBack(
  app: PIXI.Application,
  a: DisplayObj,
  b: DisplayObj,
  durationMs = 120,
  pauseMs = 40
): Promise<void> {
  const ax = a.x, ay = a.y;
  const bx = b.x, by = b.y;
  await Promise.all([
    tweenPosition(app, a, bx, by, durationMs),
    tweenPosition(app, b, ax, ay, durationMs),
  ]);
  await new Promise((r) => setTimeout(r, pauseMs));
  await Promise.all([
    tweenPosition(app, a, ax, ay, durationMs),
    tweenPosition(app, b, bx, by, durationMs),
  ]);
}

export async function animateNudge(
  app: PIXI.Application,
  a: DisplayObj,
  b: DisplayObj,
  strength = 6,
  durationMs = 80
): Promise<void> {
  const ax = a.x, ay = a.y;
  const bx = b.x, by = b.y;
  const dx = Math.sign(bx - ax) * strength;
  const dy = Math.sign(by - ay) * strength;
  await Promise.all([
    tweenPosition(app, a, ax + dx, ay + dy, durationMs),
    tweenPosition(app, b, bx - dx, by - dy, durationMs),
  ]);
  await Promise.all([
    tweenPosition(app, a, ax, ay, durationMs),
    tweenPosition(app, b, bx, by, durationMs),
  ]);
}

export async function animateClear(app: PIXI.Application, sprites: DisplayObj[], durationMs = 140): Promise<void> {
  await Promise.all(sprites.map((sp) => tweenAlphaScale(app, sp, 0, 0.6, durationMs)));
}

export async function animateDrop(
  app: PIXI.Application,
  spriteMoves: { sprite: DisplayObj; toX: number; toY: number }[],
  durationMs = 180
): Promise<void> {
  // small bounce: overshoot by 4px opposite of gravity, then settle
  await Promise.all(
    spriteMoves.map(async ({ sprite, toX, toY }) => {
      const overY = toY + 4;
      await tweenPosition(app, sprite, toX, overY, durationMs);
      await tweenPosition(app, sprite, toX, toY, 80);
    })
  );
}

function getBoardBounds(root: PIXI.Container) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const ch of root.children as any[]) {
    if (typeof ch.x === "number" && typeof ch.y === "number") {
      minX = Math.min(minX, ch.x);
      minY = Math.min(minY, ch.y);
      maxX = Math.max(maxX, ch.x);
      maxY = Math.max(maxY, ch.y);
    }
  }
  return { minX: isFinite(minX) ? minX : 0, minY: isFinite(minY) ? minY : 0, maxX: isFinite(maxX) ? maxX : 0, maxY: isFinite(maxY) ? maxY : 0 };
}

export async function animateSpecialLine(
  app: PIXI.Application,
  boardRoot: PIXI.Container,
  index: number,
  orientation: "horizontal" | "vertical",
  durationMs = 160
): Promise<void> {
  const bounds = getBoardBounds(boardRoot);
  const beam = new PIXI.Graphics();
  const thickness = 8;
  if (orientation === "horizontal") {
    const rows = Array.from(new Set(boardRoot.children.map((c: any) => c.y))).sort((a, b) => a - b);
    const y = rows[Math.max(0, Math.min(index, rows.length - 1))] + thickness;
    beam.rect(bounds.minX - 12, y - thickness / 2, (bounds.maxX - bounds.minX) + 24, thickness).fill(PIXI_COLOR_CYAN);
  } else {
    const cols = Array.from(new Set(boardRoot.children.map((c: any) => c.x))).sort((a, b) => a - b);
    const x = cols[Math.max(0, Math.min(index, cols.length - 1))] + thickness;
    beam.rect(x - thickness / 2, bounds.minY - 12, thickness, (bounds.maxY - bounds.minY) + 24).fill(PIXI_COLOR_CYAN);
  }
  beam.alpha = 0.0;
  boardRoot.addChild(beam);
  const start = performance.now();
  await new Promise<void>((resolve) => {
    const tick = () => {
      const t = Math.min(1, (performance.now() - start) / durationMs);
      beam.alpha = t < 0.5 ? t * 2 : (1 - (t - 0.5) * 2);
      if (t >= 1) {
        app.ticker.remove(tick);
        resolve();
      }
    };
    app.ticker.add(tick);
  });
  boardRoot.removeChild(beam);
}

export async function animateSpecialBomb(
  app: PIXI.Application,
  cx: number,
  cy: number,
  radiusPx = 40,
  durationMs = 220
): Promise<void> {
  const g = new PIXI.Graphics();
  g.circle(cx, cy, 1).fill(PIXI_COLOR_TEXT);
  g.alpha = 0.6;
  const start = performance.now();
  boardRootFallback(app).addChild(g);
  await new Promise<void>((resolve) => {
    const tick = () => {
      const t = Math.min(1, (performance.now() - start) / durationMs);
      const r = 1 + (radiusPx - 1) * easeInOutQuad(t);
      g.clear();
      g.circle(cx, cy, r).stroke({ color: PIXI_COLOR_PURPLE, width: 2, alpha: 0.8 - 0.8 * t });
      if (t >= 1) {
        app.ticker.remove(tick);
        resolve();
      }
    };
    app.ticker.add(tick);
  });
  g.destroy(true);
}

function boardRootFallback(app: PIXI.Application): PIXI.Container {
  return app.stage;
}

export async function animateSpecialColor(
  app: PIXI.Application,
  boardRoot: PIXI.Container,
  durationMs = 200
): Promise<void> {
  const start = performance.now();
  const origAlpha = boardRoot.alpha;
  await new Promise<void>((resolve) => {
    const tick = () => {
      const t = Math.min(1, (performance.now() - start) / durationMs);
      const pulse = 0.2 * (t < 0.5 ? t * 2 : 1 - (t - 0.5) * 2);
      boardRoot.alpha = origAlpha + pulse;
      if (t >= 1) {
        app.ticker.remove(tick);
        resolve();
      }
    };
    app.ticker.add(tick);
  });
  boardRoot.alpha = origAlpha;
}
