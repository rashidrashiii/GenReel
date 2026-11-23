// Palette from the brand colour (docs/VISUAL_UPGRADE.md §7 "Palette"). Pure functions, no randomness.

type HSL = { h: number; s: number; l: number };

export function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace("#", "").trim();
  const full = m.length === 3 ? m.split("").map((c) => c + c).join("") : m.padEnd(6, "0").slice(0, 6);
  const n = parseInt(full, 16);
  return Number.isFinite(n) ? [(n >> 16) & 255, (n >> 8) & 255, n & 255] : [27, 107, 74];
}

const toHex = (r: number, g: number, b: number) => "#" + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");

function rgbToHsl([r, g, b]: [number, number, number]): HSL {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min, s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: h * 60, s, l };
}

export function hsl({ h, s, l }: HSL) {
  h = ((h % 360) + 360) % 360; s = Math.max(0, Math.min(1, s)); l = Math.max(0, Math.min(1, l));
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return toHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
}

/** WCAG relative luminance and contrast ratio. */
export function luminance(hex: string) {
  const [r, g, b] = hexToRgb(hex).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}
export function contrast(a: string, b: string) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x! + 0.05) / (y! + 0.05);
}

/** Mix two hex colours (t = 0 -> a, 1 -> b). */
export function mix(a: string, b: string, t: number) {
  const A = hexToRgb(a), B = hexToRgb(b);
  return toHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t);
}
export const shade = (hex: string, dl: number) => { const c = rgbToHsl(hexToRgb(hex)); return hsl({ ...c, l: c.l + dl }); };

export type Palette = {
  hue: number;
  primary: string; primaryDark: string; accent: string; light: string; ink: string; white: string;
  skin: string; skinShade: string; hair: string;
  /** Background tones for sets (sky top/bottom, far, mid, floor) */
  sky: [string, string]; far: string; mid: string; floor: string; dark: boolean;
  /** Active caption word colour, chosen against the background. */
  highlight: string;
};

/** Signed shortest hue distance a -> b in degrees. */
export const hueDist = (a: number, b: number) => ((((b - a) % 360) + 540) % 360) - 180;
/** Nudge from `a` toward `b` by at most `max` degrees. */
const hueToward = (a: number, b: number, max: number) => Math.max(-max, Math.min(max, hueDist(a, b)));

export const SKINS = ["#C68642", "#8D5524", "#E0AC69", "#F1C27D"] as const;
export const INK = "#1B1F23";

/** Base palette from the brand colour. `dark` picks a night-tinted set. */
export function makePalette(primaryHex: string, opts: { dark?: boolean; skin?: number } = {}): Palette {
  const p = rgbToHsl(hexToRgb(primaryHex || "#1B6B4A"));
  // Keep the brand recognisable but usable as a fill: clamp very light / very dark brand colours.
  const primary = hsl({ ...p, s: Math.max(0.35, p.s), l: Math.min(0.55, Math.max(0.28, p.l)) });
  const primaryDark = hsl({ ...p, s: Math.max(0.35, p.s), l: Math.min(0.55, Math.max(0.28, p.l)) - 0.18 });
  const accent = hsl({ h: p.h + 35, s: 0.88, l: 0.56 });
  const light = hsl({ h: p.h, s: Math.min(0.5, p.s), l: 0.94 });
  const skin = SKINS[(opts.skin ?? 0) % SKINS.length]!;
  const dark = !!opts.dark;
  // Sets stay recognisable whatever the brand colour: a blue sky only lightly tinted toward the brand,
  // and set colours kept away from the shirt (brand) so the presenter stands out.
  const skyHue = 205 + hueToward(205, p.h, 12);
  const sky: [string, string] = dark
    ? [hsl({ h: 228, s: 0.45, l: 0.12 }), hsl({ h: 222, s: 0.4, l: 0.24 })]
    : [hsl({ h: skyHue, s: 0.62, l: 0.72 }), hsl({ h: skyHue - 10, s: 0.55, l: 0.9 })];
  const setHue = Math.abs(hueDist(p.h, 30)) < 40 ? 210 : 30; // warm neutral sets unless the brand is warm
  const far = dark ? hsl({ h: 225, s: 0.3, l: 0.22 }) : hsl({ h: skyHue, s: 0.22, l: 0.78 });
  const mid = dark ? hsl({ h: 222, s: 0.28, l: 0.16 }) : hsl({ h: setHue, s: 0.18, l: 0.7 });
  const floor = dark ? hsl({ h: 222, s: 0.25, l: 0.11 }) : hsl({ h: setHue, s: 0.16, l: 0.58 });
  // Highlight: on dark sets a warm yellow; on light sets the dark brand shade (drawn with a thick stroke).
  const highlight = dark ? "#FFD34D" : primaryDark;
  return { hue: p.h, primary, primaryDark, accent, light, ink: INK, white: "#FFFFFF", skin, skinShade: shade(skin, -0.1), hair: "#2A1C14", sky, far, mid, floor, dark, highlight };
}
