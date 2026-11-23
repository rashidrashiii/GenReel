// Canvas zones (docs/VISUAL_UPGRADE.md §4), designed at 1080x1920 and stored as fractions so 1:1 and 16:9 can follow.

export const DESIGN_W = 1080;
export const DESIGN_H = 1920;

/** A box in design pixels. */
export type Box = { x: number; y: number; w: number; h: number };

export const ZONES = {
  safe: { x: 60, y: 220, w: 960, h: 1280 },
  props: { x: 60, y: 240, w: 960, h: 620 },
  caption: { x: 80, y: 900, w: 920, h: 220 },
  progress: { x: 60, y: 200, w: 960, h: 6 },
  /** Presenter: bottom-anchored, 400x520 viewBox scaled ~1.35 -> 540x702, head ~y 1220..1420. */
  presenter: { x: 270, y: 1178, w: 540, h: 742 },
} satisfies Record<string, Box>;

/** Scale a design box to the actual canvas (width-based for x/w, height-based for y/h). */
export function toCanvas(b: Box, W: number, H: number): Box {
  const sx = W / DESIGN_W, sy = H / DESIGN_H;
  return { x: b.x * sx, y: b.y * sy, w: b.w * sx, h: b.h * sy };
}
