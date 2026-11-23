// Big counting number (docs/VISUAL_UPGRADE.md §7 "BigNumber"): prefix / number / suffix parsed from the value,
// counts up from 0 over 20 frames (ease-out), punches at the end; label beneath. Both fitted to the width.
import { interpolate } from "remotion";
import { fitText, fontFor, lineHeightFor } from "../lib/fit";
import { clamp, easeOut, springIn } from "../lib/motion";

export function parseNumber(value: string) {
  const m = /^(\D*?)([\d][\d,.]*)(.*)$/.exec(value.trim());
  if (!m) return null;
  const raw = m[2]!, n = Number(raw.replace(/,/g, ""));
  if (!Number.isFinite(n)) return null;
  const decimals = raw.includes(".") ? raw.split(".")[1]!.length : 0;
  return { prefix: m[1]!, n, suffix: m[3]!, decimals, grouped: raw.includes(",") };
}

const fmt = (v: number, decimals: number, grouped: boolean) => {
  const s = v.toFixed(decimals);
  return grouped ? Number(s).toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : s;
};

/** Frame (relative to `start`) at which the count lands, for the punch SFX. */
export const NUMBER_LAND = 20;

export function BigNumber({ value, label, f, lang, box, color, ink, labelInk = ink }: { value: string; label: string; f: number; lang: string; box: { x: number; y: number; w: number; h: number }; color: string; ink: string; labelInk?: string }) {
  // Times ("7 am", "9:30") and values with words do not count up; they just punch in.
  const p = /:|\b(am|pm|a\.m\.|p\.m\.)\b/i.test(value) || /[a-z]{3,}/i.test(value.replace(/\b(k|lakh|lakhs|crore|cr|years?|yrs?|days?|hours?|hrs?|mins?|minutes?|kg|km|l)\b/gi, "")) ? null : parseNumber(value);
  const t = interpolate(f, [0, NUMBER_LAND], [0, 1], { ...clamp, easing: easeOut });
  const shown = p ? `${p.prefix}${fmt(p.n * t, f >= NUMBER_LAND ? p.decimals : 0, p.grouped)}${p.suffix}` : value;
  const finalText = p ? `${p.prefix}${fmt(p.n, p.decimals, p.grouped)}${p.suffix}` : value;
  const numFam = fontFor("en");
  // Size from the FINAL string so the number does not grow while counting.
  const numFit = fitText(finalText, { family: numFam, weight: 800, maxWidth: box.w * 0.92, maxHeight: box.h * 0.62, maxSize: 300, maxLines: 1, lineHeight: 1 });
  const lab = fitText(label, { family: fontFor(lang), weight: 800, maxWidth: box.w * 0.9, maxHeight: box.h * 0.3, maxSize: 76, maxLines: 2, lineHeight: lineHeightFor(lang) });
  const punch = f >= NUMBER_LAND ? 1 + 0.12 * Math.sin(Math.min(1, (f - NUMBER_LAND) / 8) * Math.PI) : interpolate(f, [0, 6], [0.6, 1], clamp);
  const labIn = springIn(f, 10);
  return (
    <div style={{ position: "absolute", left: box.x, top: box.y, width: box.w, height: box.h, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: numFam, fontWeight: 800, fontSize: numFit.size, lineHeight: 1, color, WebkitTextStroke: `${numFit.size * 0.1}px ${ink}`, paintOrder: "stroke fill", transform: `scale(${punch})`, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{shown}</div>
      <div lang={lang} style={{ marginTop: 18, transform: `scale(${labIn})`, textAlign: "center" }}>
        {lab.lines.map((l, i) => <div key={i} style={{ fontFamily: fontFor(lang), fontWeight: 800, fontSize: lab.size, lineHeight: lineHeightFor(lang), color: "#FFFFFF", WebkitTextStroke: `${lab.size * 0.14}px ${labelInk}`, paintOrder: "stroke fill", whiteSpace: "nowrap" }}>{l}</div>)}
      </div>
    </div>
  );
}
