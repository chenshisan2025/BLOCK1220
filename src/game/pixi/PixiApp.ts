import * as PIXI from "pixi.js";

export function createPixiApp(container: HTMLElement) {
  const app = new PIXI.Application({
    resizeTo: container,
    backgroundAlpha: 0,
    antialias: true,
  });
  container.appendChild(app.canvas as any);
  return app;
}

export function destroyPixiApp(app: PIXI.Application) {
  app.destroy(true);
}
