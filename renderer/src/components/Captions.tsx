// Word-by-word captions (docs/VISUAL_UPGRADE.md §7 "Captions"): one page of 2-4 words at a time, centred in the caption
// band, white with a thick dark stroke; the active word takes the highlight colour and pops 1 -> 1.14 -> 1; pages
// change with a hard cut and a 2-frame scale-in (no fades). Fitted to the band (stroke included), never clipped.
import { interpolate, spring } from "remotion";
import { fitText, fontFor, lineHeightFor } from "../lib/fit";
import { clamp, FPS } from "../lib/motion";
import type { Page } from "../lib/types";

export function CaptionPage({ page, frame, lang, box, highlight, ink, maxSize = 96 }: {
  page: Page; frame: number; lang: string; box: { x: number; y: number; w: number; h: number }; highlight: string; ink: string; maxSize?: number;
}) {
  const fam = fontFor(lang), lh = lineHeightFor(lang);
  const text = page.words.map((w) => w.w).join(" ");
  // Words are separated by real spaces, so the canvas measurement equals the drawn line; the stroke (0.07 em
  // outside each glyph) and the active-word pop (14%) need room: fit to a narrower box.
  const fit = fitText(text, { family: fam, weight: 800, maxWidth: box.w / 1.14 - maxSize * 0.3, maxHeight: box.h / 1.1, maxSize, lineHeight: lh, maxLines: 2 });
  const stroke = Math.max(6, fit.size * 0.14);
  const enter = interpolate(frame - page.from, [0, 2], [0.86, 1], clamp);
  let wordIndex = 0;
  return (
    <div lang={lang} style={{ position: "absolute", left: box.x, top: box.y, width: box.w, height: box.h, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `scale(${enter})` }}>
      {fit.lines.map((line, li) => (
        <div key={li} style={{ whiteSpace: "nowrap", fontFamily: fam, fontWeight: 800, fontSize: fit.size, lineHeight: lh, textAlign: "center" }}>
          {line.split(" ").map((_, k) => {
            const w = page.words[wordIndex++]!;
            const next = page.words[wordIndex]?.f0 ?? page.to;
            const active = frame >= w.f0 - 1 && frame < next;
            const pop = active ? spring({ frame: frame - w.f0 + 1, fps: FPS, config: { damping: 9, stiffness: 260, mass: 0.4 }, durationInFrames: 6 }) : 0;
            const s = active ? 1 + 0.14 * Math.sin(Math.min(1, pop) * Math.PI) : 1;
            return (
              <span key={k}>{k > 0 ? " " : ""}<span style={{ display: "inline-block", transform: `scale(${s})`, transformOrigin: "50% 65%",
                color: active ? highlight : "#FFFFFF", WebkitTextStroke: `${stroke}px ${active && highlight !== "#FFD34D" ? "#FFFFFF" : ink}`, paintOrder: "stroke fill" }}>
                {w.w}
              </span></span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/** The hook title only replaces the captions when it can be big (a long title would be small and unreadable). */
export function hookTitleFits(text: string, lang: string, box: { w: number; h: number }) {
  return fitText(text, { family: fontFor(lang), weight: 800, maxWidth: box.w - 40, maxHeight: box.h, maxSize: 120, lineHeight: lineHeightFor(lang), maxLines: 2 }).size >= 84;
}

/** Big one-line title for the hook (first 45 frames), fitted to the width. */
export function HookTitle({ text, frame, lang, box, ink, accent }: { text: string; frame: number; lang: string; box: { x: number; y: number; w: number; h: number }; ink: string; accent: string }) {
  const fam = fontFor(lang), lh = lineHeightFor(lang);
  const fit = fitText(text, { family: fam, weight: 800, maxWidth: box.w - 40, maxHeight: box.h, maxSize: 120, lineHeight: lh, maxLines: 2 });
  const s = spring({ frame, fps: FPS, config: { damping: 11, stiffness: 200, mass: 0.6 } });
  return (
    <div lang={lang} style={{ position: "absolute", left: box.x, top: box.y, width: box.w, height: box.h, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `scale(${0.6 + 0.4 * s}) rotate(${(1 - s) * -4}deg)` }}>
      {fit.lines.map((l, i) => (
        <div key={i} style={{ whiteSpace: "nowrap", fontFamily: fam, fontWeight: 800, fontSize: fit.size, lineHeight: lh, color: i === fit.lines.length - 1 ? accent : "#FFFFFF", WebkitTextStroke: `${fit.size * 0.14}px ${ink}`, paintOrder: "stroke fill" }}>{l}</div>
      ))}
    </div>
  );
}
