// Text fitting (docs/VISUAL_UPGRADE.md "Text fitting"). Measures with the browser canvas AFTER the font has loaded
// (@remotion/layout-utils is not installed and we are offline), breaks lines only at spaces, shrinks to fit.
import { useEffect, useState } from "react";
import { continueRender, delayRender } from "remotion";

export const FONTS: Record<string, string> = {
  en: '"Noto Sans", sans-serif',
  ml: '"Noto Sans Malayalam", "Noto Sans", sans-serif',
  hi: '"Noto Sans Devanagari", "Noto Sans", sans-serif',
  ta: '"Noto Sans Tamil", "Noto Sans", sans-serif',
};
export const fontFor = (lang: string) => FONTS[lang] ?? FONTS.en!;
/** Malayalam/Tamil stack marks above and below; give them room (doc: Malayalam line-height 1.6). */
export const lineHeightFor = (lang: string) => (lang === "ml" || lang === "ta" ? 1.6 : lang === "hi" ? 1.45 : 1.18);

let ctx: CanvasRenderingContext2D | null = null;
const cache = new Map<string, number>();

/** Width of `text` at 100px in the given font, in px. Cached. */
export function measure100(text: string, family: string, weight = 800) {
  const key = `${weight}|${family}|${text}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;
  ctx ??= document.createElement("canvas").getContext("2d");
  if (!ctx) return text.length * 60;
  ctx.font = `${weight} 100px ${family}`;
  const w = ctx.measureText(text).width;
  cache.set(key, w);
  return w;
}

export type Fitted = { size: number; lines: string[] };

/**
 * Largest font size (<= maxSize) at which `text` wraps (at spaces only) into <= maxLines lines, each <= maxWidth,
 * with total height <= maxHeight. Single words that are too long shrink the size rather than break.
 */
export function fitText(text: string, o: { family: string; weight?: number; maxWidth: number; maxHeight: number; maxSize: number; minSize?: number; maxLines?: number; lineHeight?: number }): Fitted {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const weight = o.weight ?? 800, lh = o.lineHeight ?? 1.2, maxLines = o.maxLines ?? 3, min = o.minSize ?? 18;
  if (!words.length) return { size: o.maxSize, lines: [] };
  const space = measure100(" ", o.family, weight);
  const w100 = words.map((w) => measure100(w, o.family, weight));
  for (let size = o.maxSize; size >= min; size -= 2) {
    const k = size / 100, lines: string[] = [];
    let cur: string[] = [], curW = 0, ok = true;
    for (let i = 0; i < words.length; i++) {
      const ww = w100[i]! * k;
      if (ww > o.maxWidth) { ok = false; break; }
      const add = cur.length ? space * k + ww : ww;
      if (cur.length && curW + add > o.maxWidth) { lines.push(cur.join(" ")); cur = [words[i]!]; curW = ww; }
      else { cur.push(words[i]!); curW += add; }
    }
    if (!ok) continue;
    if (cur.length) lines.push(cur.join(" "));
    if (lines.length <= maxLines && lines.length * size * lh <= o.maxHeight) return { size, lines: balance(lines, words, w100, space, k, o.maxWidth) };
  }
  // Last resort: smallest size, one word per line is still guaranteed to fit the width at min size or below.
  return { size: min, lines: words };
}

/** Even out a 2-line wrap so the last line is not a lonely word ("big top, tiny bottom"). */
function balance(lines: string[], words: string[], w100: number[], space: number, k: number, maxWidth: number) {
  if (lines.length !== 2 || words.length < 3) return lines;
  const widthOf = (a: number, b: number) => w100.slice(a, b).reduce((s, w) => s + w * k, 0) + space * k * Math.max(0, b - a - 1);
  let best = lines, bestDiff = Infinity;
  for (let cut = 1; cut < words.length; cut++) {
    const a = widthOf(0, cut), b = widthOf(cut, words.length);
    if (a > maxWidth || b > maxWidth) continue;
    const d = Math.abs(a - b);
    if (d < bestDiff) { bestDiff = d; best = [words.slice(0, cut).join(" "), words.slice(cut).join(" ")]; }
  }
  return best;
}

/**
 * Hold the render until the language fonts are loaded, so measurements match what is drawn. Returns true once
 * ready; render text only then (measuring earlier would use a fallback font). Call once, at the top.
 */
export function useFontsReady(langs: string[]) {
  const key = langs.join(",");
  const [handle] = useState(() => delayRender("fonts"));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const sample: Record<string, string> = { en: "Aa", ml: "മലയാളം", hi: "हिन्दी", ta: "தமிழ்" };
    Promise.all(key.split(",").flatMap((l) => [800, 700, 600].map((wt) => document.fonts.load(`${wt} 40px ${fontFor(l)}`, sample[l] ?? "Aa"))))
      .catch(() => undefined)
      .then(() => { cache.clear(); setReady(true); continueRender(handle); });
  }, [handle, key]);
  return ready;
}
