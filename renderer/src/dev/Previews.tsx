// Review-only compositions (stills). Not used by the production render.
import { useEffect, useRef, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { Background, type BgPreset } from "../components/Background";
import { Camera, type CameraKind } from "../components/Camera";
import { ProgressBar } from "../components/ProgressBar";
import { Presenter } from "../components/Presenter";
import { fitText, fontFor, lineHeightFor, useFontsReady } from "../lib/fit";
import { toCanvas, ZONES } from "../lib/layout";
import { makePalette } from "../lib/palette";

export type BgPreviewProps = { preset: BgPreset; dark: boolean; primary: string; camera: CameraKind; text: string; lang: string; zones: boolean };

/** One background preset with camera, progress bar, a fitted caption and (optionally) the safe zones outlined. */
export function BgPreview({ preset, dark, primary, camera, text, lang, zones }: BgPreviewProps) {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const ready = useFontsReady([lang]);
  const pal = makePalette(primary, { dark });
  const cap = toCanvas(ZONES.caption, width, height);
  const fam = fontFor(lang), lh = lineHeightFor(lang);
  const fit = ready ? fitText(text, { family: fam, maxWidth: cap.w, maxHeight: cap.h, maxSize: 96, lineHeight: lh, maxLines: 2 }) : null;
  return (
    <AbsoluteFill>
      <Camera kind={camera} frame={frame} dur={durationInFrames} seed="preview">
        <Background preset={preset} pal={pal} frame={frame} dur={durationInFrames} />
      </Camera>
      {(() => { const z = toCanvas(ZONES.presenter, width, height); return (
        <div style={{ position: "absolute", left: z.x, top: z.y, width: z.w, height: z.w * 1.3 }}>
          <Presenter pal={pal} pose="point" poseFrame={30} frame={frame} mouth={1} />
        </div>); })()}
      <ProgressBar color={pal.accent} />
      {fit && (
        <div lang={lang} style={{ position: "absolute", left: cap.x, top: cap.y, width: cap.w, height: cap.h, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          {fit.lines.map((l, i) => (
            <div key={i} style={{ fontFamily: fam, fontWeight: 800, fontSize: fit.size, lineHeight: lh, color: "#fff", WebkitTextStroke: `${fit.size * 0.16}px ${pal.ink}`, paintOrder: "stroke fill", whiteSpace: "nowrap" }}>{l}</div>
          ))}
        </div>
      )}
      {zones && Object.entries(ZONES).map(([k, z]) => {
        const b = toCanvas(z, width, height);
        return <div key={k} style={{ position: "absolute", left: b.x, top: b.y, width: b.w, height: b.h, outline: "3px dashed rgba(255,0,128,0.8)", color: "#ff0080", font: "700 22px sans-serif", padding: 4 }}>{k}</div>;
      })}
    </AbsoluteFill>
  );
}

const SAMPLES: { lang: string; text: string }[] = [
  { lang: "ml", text: "ട്രാൻസ്ജെൻഡർ" },
  { lang: "ml", text: "നഗരത്തിലേക്ക്" },
  { lang: "ml", text: "ട്രാൻസ്ജെൻഡർ നഗരത്തിലേക്ക്" },
  { lang: "ml", text: "നഗരത്തിലേക്ക് ട്രാൻസ്ജെൻഡർ വിദ്യാർത്ഥികൾക്ക്" },
  { lang: "ml", text: "ഓണക്കാലത്തെ ഏറ്റവും വലിയ വിലക്കിഴിവ്" },
  { lang: "en", text: "Internationalization responsibilities" },
  { lang: "en", text: "Kochi Metro has a few surprising secrets" },
  { lang: "hi", text: "अंतर्राष्ट्रीयकरण प्रतिस्पर्धात्मकता" },
];

/** Long-word fit test at 1080 wide: each sample in a caption-band box; the DOM is measured after layout. */
export function FitTest() {
  const { width, height } = useVideoConfig();
  const ready = useFontsReady(["en", "ml", "hi"]);
  const cap = toCanvas(ZONES.caption, width, height);
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const [handle] = useState(() => delayRender("fit-check"));
  const [result, setResult] = useState<string[] | null>(null);
  useEffect(() => {
    if (!ready) return;
    const id = requestAnimationFrame(() => {
      const out = SAMPLES.map((s, i) => {
        const box = refs.current[i];
        if (!box) return `${i}: missing`;
        const r = box.getBoundingClientRect();
        const bad = [...box.querySelectorAll("span")].some((sp) => { const q = sp.getBoundingClientRect(); return q.left < r.left - 1 || q.right > r.right + 1 || q.top < r.top - 1 || q.bottom > r.bottom + 1; });
        return bad ? `FAIL ${s.lang} "${s.text}"` : "PASS";
      });
      setResult(out);
      continueRender(handle);
    });
    return () => cancelAnimationFrame(id);
  }, [ready, handle]);
  const rowH = (height - 160) / SAMPLES.length;
  return (
    <AbsoluteFill style={{ background: "#14222b" }}>
      {ready && SAMPLES.map((s, i) => {
        const fam = fontFor(s.lang), lh = lineHeightFor(s.lang);
        const h = Math.min(cap.h, rowH - 20);
        const fit = fitText(s.text, { family: fam, maxWidth: cap.w, maxHeight: h, maxSize: 96, lineHeight: lh, maxLines: 2 });
        return (
          <div key={i} style={{ position: "absolute", left: cap.x, top: 40 + i * rowH, width: cap.w }}>
            <div ref={(el) => { refs.current[i] = el; }} lang={s.lang} style={{ width: cap.w, height: h, outline: "2px solid #5bd", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "visible" }}>
              {fit.lines.map((l, k) => <span key={k} style={{ display: "block", fontFamily: fam, fontWeight: 800, fontSize: fit.size, lineHeight: lh, color: "#fff", whiteSpace: "nowrap" }}>{l}</span>)}
            </div>
            <div style={{ font: "600 22px sans-serif", color: result?.[i] === "PASS" ? "#7CFC9A" : "#FF6B6B", marginTop: 2 }}>{result?.[i] ?? "…"} · {fit.size}px · {fit.lines.length} line(s)</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
}
