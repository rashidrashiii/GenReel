// Shared colours and pieces for props (docs/VISUAL_UPGRADE.md §7 "Props"): flat shapes in a 256x256 viewBox,
// 2-4 fills, a darker underside, rounded corners, no gradients, no filters, no text.
import type { FC } from "react";
import type { Palette } from "../lib/palette";
import { shade } from "../lib/palette";

/** Colours a prop may use: brand colours for generic objects, natural colours where the object implies one. */
export function kit(pal: Palette) {
  return {
    brand: pal.primary, brandD: pal.primaryDark, accent: pal.accent, accentD: shade(pal.accent, -0.14), light: pal.light,
    white: "#FFFFFF", paper: "#F4F1EA", ink: "#2A2F35", inkSoft: "#4A525C",
    gold: "#F5B82E", goldD: "#D08A12", red: "#E5484D", redD: "#B8323A", green: "#3FA34D", greenD: "#2B7A37",
    leaf: "#58B368", blue: "#3B8FE0", blueD: "#2768AE", sky: "#8FD3F4", orange: "#F28C28", wood: "#9A6236", woodD: "#74462A",
    grey: "#C9D1D9", greyD: "#97A3AF", skin: pal.skin, skinD: pal.skinShade,
  };
}
export type Kit = ReturnType<typeof kit>;
export type PropArt = FC<{ k: Kit }>;

/** Soft ground shadow shared by every prop so they read as one set. */
export const Ground = ({ y = 236, w = 150 }: { y?: number; w?: number }) => <ellipse cx={128} cy={y} rx={w / 2} ry={10} fill="#000" opacity={0.12} />;
