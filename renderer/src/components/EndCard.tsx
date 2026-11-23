// Brand end card (docs/VISUAL_UPGRADE.md §7 "EndCard"): built by code from the brand, never from the model.
// Logo (if any), name, contact (only if provided), a call to action; everything pops in. 60 frames.
import { Img, staticFile } from "remotion";
import { fitText, fontFor, lineHeightFor } from "../lib/fit";
import { interpolate } from "remotion";
import { clamp, springIn, wave } from "../lib/motion";
import { PropView } from "./Prop";
import type { Palette } from "../lib/palette";
import { mix } from "../lib/palette";

const CTA: Record<string, string> = { en: "Follow for more", ml: "കൂടുതൽ അറിയാൻ ഫോളോ ചെയ്യൂ", hi: "और जानने के लिए फ़ॉलो करें", ta: "மேலும் அறிய பின்தொடருங்கள்" };

export function EndCard({ f, pal, lang, name, contact, logo, title, width, height }: {
  f: number; pal: Palette; lang: string; name: string | null; contact: string | null; logo: string | null; title: string; width: number; height: number;
}) {
  const u = width / 1080;
  const fam = fontFor(lang), lh = lineHeightFor(lang);
  const head = name || title;
  const headFit = fitText(head, { family: fam, weight: 800, maxWidth: 900 * u, maxHeight: 360 * u, maxSize: 120 * u, maxLines: 2, lineHeight: lh });
  const cFit = contact ? fitText(contact, { family: fontFor("en") + "", weight: 700, maxWidth: 880 * u, maxHeight: 160 * u, maxSize: 58 * u, maxLines: 2, lineHeight: 1.3 }) : null;
  const ctaFit = fitText(CTA[lang] ?? CTA.en!, { family: fam, weight: 800, maxWidth: 820 * u, maxHeight: 140 * u, maxSize: 56 * u, maxLines: 2, lineHeight: lh });
  const s = (d: number) => springIn(f, d);
  const W = (fx: number) => width * fx - 85 * u;
  return (
    // Second phase at ~0.9 s: the background warms from the dark brand shade to the brand colour, so the card changes
    // visibly before the video ends (a 2 s card would otherwise read as frozen).
    <div style={{ position: "absolute", inset: 0, background: mix(pal.primaryDark, pal.primary, interpolate(f, [26, 32], [0, 1], clamp)), overflow: "hidden" }}>
      {/* moving rings so the card is never static */}
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ position: "absolute", left: width / 2 - (420 + i * 260) * u, top: height * 0.42 - (420 + i * 260) * u, width: (840 + i * 520) * u, height: (840 + i * 520) * u,
          borderRadius: "50%", opacity: 0.5 - i * 0.12, border: `${26 * u}px solid ${f >= 29 ? pal.light : pal.primary}`, transform: `scale(${0.85 + 0.15 * s(i * 4) + wave(f, 24, 0.1, i * 1.4)})` }} />
      ))}
      {/* floating props so the card is alive until the last frame */}
      {[["star", 0.12, 0.2, 0], ["heart", 0.78, 0.16, 6], ["star", 0.82, 0.72, 10], ["thumbs_up", 0.08, 0.7, 4]].map(([tag, x, y, d], k) => (
        <div key={k} style={{ position: "absolute", left: W(x as number), top: height * (y as number) + wave(f, 44, 22, k), width: 170 * u, height: 170 * u, transform: `rotate(${wave(f, 50, 10, k)}deg)` }}>
          <PropView tag={tag as string} pal={pal} size={170 * u} enter="pop" idle="none" f={f - (d as number)} left={999} />
        </div>
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, top: height * 0.18, bottom: height * 0.22, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28 * u }}>
        {logo && <Img src={staticFile(logo)} style={{ height: 200 * u, maxWidth: 520 * u, objectFit: "contain", transform: `scale(${s(0)})`, background: "#fff", borderRadius: 28 * u, padding: 18 * u }} />}
        <div lang={lang} style={{ transform: `scale(${s(4)}) translateY(${wave(f, 60, 8)}px)`, textAlign: "center" }}>
          {headFit.lines.map((l, i) => <div key={i} style={{ fontFamily: fam, fontWeight: 800, fontSize: headFit.size, lineHeight: lh, color: "#FFFFFF", whiteSpace: "nowrap" }}>{l}</div>)}
        </div>
        {cFit && <div style={{ transform: `scale(${s(9)})`, textAlign: "center" }}>
          {cFit.lines.map((l, i) => <div key={i} style={{ fontFamily: fontFor("en"), fontWeight: 700, fontSize: cFit.size, lineHeight: 1.3, color: pal.light, whiteSpace: "nowrap" }}>{l}</div>)}
        </div>}
        <div lang={lang} style={{ transform: `scale(${s(14) * (1 + wave(f, 24, 0.05))})`, marginTop: 20 * u, background: "#FFD34D", color: pal.ink, borderRadius: 999, padding: `${14 * u}px ${44 * u}px`, textAlign: "center" }}>
          {ctaFit.lines.map((l, i) => <div key={i} style={{ fontFamily: fam, fontWeight: 800, fontSize: ctaFit.size, lineHeight: lh, whiteSpace: "nowrap" }}>{l}</div>)}
        </div>
      </div>
    </div>
  );
}
