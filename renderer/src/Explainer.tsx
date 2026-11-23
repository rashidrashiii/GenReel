// genreel animated explainer (docs/VISUAL_UPGRADE.md): beats on word timings, each with a set, a camera move, props /
// number / photo, the presenter (continuous across beats, lip-synced from the voice) and word-pop captions.
// Transitions are drawn here (no text cross-fades): whip = old slides out left while new slides in from the right,
// zoom = punch out and in, iris = circular reveal, cut. Then a brand end card. One voice, music ducked, SFX.
import { useMemo } from "react";
import { AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { Background } from "./components/Background";
import { BigNumber, NUMBER_LAND } from "./components/BigNumber";
import { Camera } from "./components/Camera";
import { CaptionPage, HookTitle, hookTitleFits } from "./components/Captions";
import { DiagramBuilder } from "./components/DiagramBuilder";
import { EndCard } from "./components/EndCard";
import { Presenter, mouthShapes, type Pose } from "./components/Presenter";
import { ProgressBar } from "./components/ProgressBar";
import { PropLayer, PropView } from "./components/Prop";
import { useFontsReady } from "./lib/fit";
import { toCanvas, ZONES, type Box } from "./lib/layout";
import { clamp, easeIn, easeOut, springIn, wave } from "./lib/motion";
import { makePalette } from "./lib/palette";
import type { BeatData, ExplainerProps, Sfx, Transition } from "./lib/types";

const ENTRY: Record<Transition, number> = { cut: 0, zoom: 0, whip: 8, iris: 2 };
const HOOK_TITLE_FRAMES = 45;

/** Default pose when the beat has none: vary by layout and position so the presenter keeps moving. */
const defaultPose = (b: BeatData, i: number): Pose =>
  b.presenter?.pose ?? (b.layout === "number" ? "surprised" : b.layout === "row" ? "explain" : (["explain", "point", "neutral", "point"] as Pose[])[i % 4]!);

const box = (b: Box, W: number, H: number) => toCanvas(b, W, H);

export const Explainer = (p: ExplainerProps) => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const ready = useFontsReady([...new Set([p.language, "en"])]);
  const shapes = useMemo(() => mouthShapes(p.mouth), [p.mouth]);
  const musicVol = useMemo(() => musicVolumes(p.total, p.speech), [p.total, p.speech]);
  const sfx = useMemo(() => planSfx(p.beats), [p.beats]);
  const base = makePalette(p.primary);
  if (!ready) return <AbsoluteFill style={{ background: base.primaryDark }} />;

  return (
    <AbsoluteFill lang={p.language} style={{ background: base.primaryDark, overflow: "hidden" }}>
      {p.beats.map((b, i) => {
        const tIn = i === 0 ? "cut" : b.transition ?? "cut";
        const enter = ENTRY[tIn];
        const from = Math.max(0, b.from - enter);
        return (
          <Sequence key={i} from={from} durationInFrames={Math.max(1, b.to - from)} name={`${i + 1} ${b.layout}`} layout="none">
            <BeatScene p={p} b={b} i={i} frame={frame} shapes={shapes} W={W} H={H} />
          </Sequence>
        );
      })}
      <Sequence from={p.contentEnd} durationInFrames={Math.max(1, p.total - p.contentEnd)} name="end card" layout="none">
        <EndCard f={frame - p.contentEnd} pal={base} lang={p.language} name={p.brand.name} contact={p.brand.contact} logo={p.brand.logo} title={p.title} width={W} height={H} />
      </Sequence>
      {frame < p.contentEnd && <ProgressBar color={base.accent} />}
      {p.brand.logo && frame < p.contentEnd && (
        <Img src={staticFile(p.brand.logo)} style={{ position: "absolute", right: W * 0.055, top: H * 0.122, height: 84 * (W / 1080), maxWidth: 220 * (W / 1080), objectFit: "contain", background: "rgba(255,255,255,0.92)", borderRadius: 14, padding: 8 }} />
      )}

      <Audio src={staticFile(p.voice)} />
      {p.music && <Audio src={staticFile(p.music)} loop volume={(f) => musicVol[Math.min(musicVol.length - 1, Math.max(0, Math.round(f)))] ?? 0.2} />}
      {sfx.map((e, k) => p.sfx[e.kind] && (
        <Sequence key={k} from={Math.max(0, e.at)} durationInFrames={24} layout="none" name={`sfx ${e.kind}`}>
          <Audio src={staticFile(p.sfx[e.kind]!)} volume={0.6} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ one beat
function BeatScene({ p, b, i, frame, shapes, W, H }: { p: ExplainerProps; b: BeatData; i: number; frame: number; shapes: number[]; W: number; H: number }) {
  const preset = b.background ?? p.background;
  const pal = makePalette(p.primary, { dark: preset === "night" });
  const f = frame - b.from; // negative during the entry transition
  const dur = b.to - b.from;
  const next = p.beats[i + 1];
  const tIn: Transition = i === 0 ? "cut" : b.transition ?? "cut";
  const tOut: Transition = next ? next.transition ?? "cut" : "cut";
  const outLen = ENTRY[tOut];

  // Transition transforms on the whole beat (scene + captions move together, fully opaque).
  let tx = 0, scale = 1, clip: string | undefined;
  if (tIn === "whip" && f < 0) tx = interpolate(f, [-ENTRY.whip, 0], [W, 0], { ...clamp, easing: easeOut });
  if (tIn === "iris" && f < 0) clip = `circle(${interpolate(f, [-ENTRY.iris, 0], [35, 80], { ...clamp, easing: easeOut })}% at 50% 42%)`; // opens big: a clear change on frame 1
  if (tIn === "zoom") scale *= interpolate(f, [0, 6], [1.15, 1], { ...clamp, easing: easeOut });
  if (tIn === "cut" && i > 0) scale *= interpolate(f, [0, 2], [1.03, 1], clamp);
  const toEnd = b.to - frame; // frames left
  if (tOut === "whip" && toEnd <= outLen) tx += interpolate(toEnd, [0, outLen], [-W, 0], { ...clamp, easing: easeIn });
  if (tOut === "zoom" && toEnd <= 4) scale *= interpolate(toEnd, [0, 4], [1.15, 1], clamp);

  const cf = Math.max(0, f); // camera/background/props time
  // Wash state alternates on every segment of the video (a long beat counts as two), so neighbours always differ.
  const isLong = (x: BeatData) => x.to - x.from > 80;
  const segBefore = p.beats.slice(0, i).reduce((n, x) => n + (isLong(x) ? 2 : 1), 0);
  const washOn = (segBefore + (isLong(b) && cf >= Math.round(dur / 2) ? 1 : 0)) % 2 === 1;
  // A visible camera kick on every new caption page (about every 0.8-1.5 s), like a jump-cut edit: the framing snaps in
  // 2 frames to alternate zoom 1.00 / 1.12 with a sideways shift; long gaps between pages get extra kicks.
  const pageKicks = b.pages.map((pg) => pg.from - b.from).filter((k) => k > 6 && k < dur - 8);
  // No stretch longer than 36 frames (1.2 s) without a kick: fill long gaps evenly.
  const kicks: number[] = [];
  [0, ...pageKicks, dur].forEach((k, j, arr) => {
    if (j === 0) return;
    const a = arr[j - 1]!, gap = k - a, extra = Math.ceil(gap / 36) - 1;
    for (let e = 1; e <= extra; e++) kicks.push(Math.round(a + (gap * e) / (extra + 1)));
    if (j < arr.length - 1) kicks.push(k);
  });
  let passed = 0;
  while (passed < kicks.length && cf >= kicks[passed]!) passed++;
  const target = (n: number) => ({ z: n % 2 ? 1.15 : 1, x: n % 2 ? ((i + n) % 2 ? 1 : -1) * W * 0.06 : 0 });
  const kp = passed ? interpolate(cf - kicks[passed - 1]!, [0, 2], [0, 1], { ...clamp, easing: easeOut }) : 1;
  const from_ = target(Math.max(0, passed - 1)), to_ = target(passed);
  const inner = from_.z + (to_.z - from_.z) * kp;
  const innerX = from_.x + (to_.x - from_.x) * kp;
  const layout = b.layout === "diagram" && !b.diagram ? "stack" : b.layout;
  const board = layout === "diagram"; // a diagram takes the whole frame; the presenter is in the beats around it
  const showPresenter = layout !== "hero" && !board;
  const big = layout === "presenter_big";
  // Zones per layout (design px).
  // Malayalam/Tamil stack marks above and below the line (line-height 1.6): their caption band is taller.
  const tall = p.language === "ml" || p.language === "ta";
  const capZ: Box = layout === "hero" || board ? { x: 80, y: tall ? 1200 : 1230, w: 920, h: tall ? 300 : 230 } : big ? { x: 80, y: 540, w: 920, h: tall ? 300 : 240 }
    : tall ? { x: 80, y: 860, w: 920, h: 300 } : ZONES.caption;
  const propZ: Box = board ? { x: 60, y: 270, w: 960, h: 900 } : layout === "hero" ? { x: 60, y: 300, w: 960, h: 880 } : big ? { x: 60, y: 250, w: 960, h: 300 } : ZONES.props;
  const pz = box(propZ, W, H), cz = box(capZ, W, H);

  // Presenter: pose blends from the previous beat's pose starting at this beat's entry.
  const pose = defaultPose(b, i);
  const prev = i > 0 ? defaultPose(p.beats[i - 1]!, i - 1) : "neutral";
  const lastEmph = [...b.emph].reverse().find((e) => e <= frame);
  const side = b.presenter?.side ?? "center";
  const presZ = big ? { x: 90, y: 760, w: 900, h: 1160 } : { ...ZONES.presenter, x: side === "left" ? 40 : side === "right" ? 500 : 270 };
  const prz = box(presZ, W, H);

  const page = b.pages.find((pg) => frame >= pg.from && frame < pg.to) ?? (frame < (b.pages[0]?.from ?? 0) ? undefined : b.pages.at(-1));
  const hookBox = box({ x: 60, y: 820, w: 960, h: 330 }, W, H);
  const hook = i === 0 && frame < HOOK_TITLE_FRAMES && hookTitleFits(p.title, p.language, hookBox);

  return (
    <AbsoluteFill style={{ transform: `translateX(${tx}px) scale(${scale})`, clipPath: clip, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translateX(${innerX}px) scale(${inner})`, transformOrigin: "50% 45%" }}>
      <Camera kind={b.camera} frame={cf} dur={dur} seed={`cam${i}`}>
        {/* each beat alternates a wide and a tight framing of its set, like a new camera angle */}
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${(((i * 3) % 5) - 2) * W * 0.06}px) scale(${i % 2 ? 1.45 : 1.12})`, transformOrigin: "50% 70%" }}>
          <Background preset={preset} pal={pal} frame={cf} dur={dur} dir={i % 2 ? 1 : -1} />
          {/* every other beat (daytime sets) gets a brand-colour wash, so each beat change reads as a new shot */}
          {/* beats longer than ~2.7 s flip it halfway, so no stretch goes 3 s without a clear change */}
          {!pal.dark && washOn && <AbsoluteFill style={{ background: pal.primaryDark, opacity: 0.38 }} />}
        </div>
        {(layout === "hero" || layout === "number") && <Rays f={cf} zone={pz} color="#FFFFFF" />}
        {b.photo ? (
          <PhotoCard src={b.photo} f={cf} dur={dur} zone={pz} />
        ) : layout === "number" && b.number ? (
          <BigNumber value={b.number.value} label={b.number.label} f={cf} lang={p.language} box={pz} color={pal.dark ? "#FFD34D" : pal.primaryDark} ink={pal.dark ? pal.ink : "#FFFFFF"} labelInk={pal.ink} />
        ) : layout === "diagram" && b.diagram ? (
          <DiagramBuilder kind={b.diagram.kind} nodes={b.diagram.nodes} pal={pal} f={cf} dur={dur} zone={pz} lang={p.language}
            appearAt={b.diagram.nodes.map((_, k) => { const w = b.words[Math.floor((k * b.words.length) / b.diagram!.nodes.length)]; return w ? Math.max(0, w.f0 - b.from) : undefined; }).filter((x): x is number => x !== undefined)} />
        ) : b.props?.length ? (
          layout === "row" ? <RowProps props={b.props} pal={pal} f={cf} dur={dur} zone={pz} />
            : layout === "hero" ? <HeroProp tag={b.props[0]!.tag} enter={b.props[0]!.enter} idle={b.props[0]!.idle} pal={pal} f={cf} dur={dur} zone={pz} />
              : <PropLayer props={b.props} pal={pal} f={cf} dur={dur} zone={pz} scale={big ? 0.6 : 1} />
        ) : null}
        {showPresenter && (
          <div style={{ position: "absolute", left: prz.x, top: prz.y, width: prz.w, height: prz.w * 1.3, transform: side === "right" ? "scaleX(-1)" : undefined }}>
            <Presenter pal={pal} pose={pose} prevPose={prev} poseFrame={f + ENTRY[tIn]} frame={frame} mouth={(shapes[frame] ?? 0) as 0 | 1 | 2}
              emphasisAgo={lastEmph === undefined ? 999 : frame - lastEmph} seed="host" />
          </div>
        )}
      </Camera>
      </AbsoluteFill>
      {hook ? <HookTitle text={p.title} frame={frame} lang={p.language} box={hookBox} ink={pal.ink} accent="#FFD34D" />
        : page && <CaptionPage page={page} frame={frame} lang={p.language} box={cz} highlight={pal.dark ? "#FFD34D" : pal.highlight === pal.primaryDark ? "#FFD34D" : pal.highlight} ink={pal.ink} />}
    </AbsoluteFill>
  );
}

// ------------------------------------------------------------------------------------------------ layout pieces
function RowProps({ props, pal, f, dur, zone }: { props: NonNullable<BeatData["props"]>; pal: ReturnType<typeof makePalette>; f: number; dur: number; zone: Box }) {
  const n = Math.min(3, props.length), size = (zone.w / n) * 0.86;
  return (
    <>
      {props.slice(0, 3).map((pr, k) => (
        <div key={k} style={{ position: "absolute", left: zone.x + (zone.w / n) * (k + 0.5) - size / 2, top: zone.y + zone.h * 0.52 - size / 2, width: size, height: size }}>
          <PropView tag={pr.tag} pal={pal} size={size} enter={pr.enter ?? "pop"} idle={pr.idle ?? "float"} f={f - k * 5} left={dur - f} phase={k * 1.3} />
        </div>
      ))}
    </>
  );
}

function HeroProp({ tag, enter, idle, pal, f, dur, zone }: { tag: string; enter?: "pop" | "slide_up" | "drop" | "draw_on" | "wipe_in"; idle?: "float" | "pulse" | "wobble" | "none"; pal: ReturnType<typeof makePalette>; f: number; dur: number; zone: Box }) {
  const size = Math.min(zone.w, zone.h) * 0.9;
  return (
    <div style={{ position: "absolute", left: zone.x + zone.w / 2 - size / 2, top: zone.y + zone.h / 2 - size / 2, width: size, height: size }}>
      <div style={{ transform: `translateY(${wave(f, 48, 14)}px) rotate(${wave(f, 70, 4)}deg) scale(${1 + wave(f, 36, 0.05)})` }}>
        <PropView tag={tag} pal={pal} size={size} enter={enter ?? "pop"} idle={idle ?? "pulse"} f={f} left={dur - f} />
      </div>
    </div>
  );
}

/** Light rays turning slowly behind a hero prop or a number, so the shot keeps moving after its entrance. */
function Rays({ f, zone, color }: { f: number; zone: Box; color: string }) {
  const r = Math.max(zone.w, zone.h) * 0.75, n = 14;
  const grow = springIn(f, 0, { damping: 20 });
  return (
    <svg style={{ position: "absolute", left: zone.x + zone.w / 2 - r, top: zone.y + zone.h / 2 - r, width: r * 2, height: r * 2, overflow: "visible" }} viewBox={`${-r} ${-r} ${r * 2} ${r * 2}`}>
      <g transform={`rotate(${f * 0.9}) scale(${grow})`} opacity={0.28}>
        {Array.from({ length: n }, (_, i) => {
          const a0 = (i * 2 * Math.PI) / n, a1 = a0 + Math.PI / n;
          return <path key={i} d={`M0 0 L${Math.cos(a0) * r} ${Math.sin(a0) * r} L${Math.cos(a1) * r} ${Math.sin(a1) * r} Z`} fill={color} />;
        })}
      </g>
    </svg>
  );
}

/** The user's own photo, framed like a print, with a slow push and a pop-in. */
function PhotoCard({ src, f, dur, zone }: { src: string; f: number; dur: number; zone: Box }) {
  const w = Math.min(zone.w * 0.8, zone.h * 1.1), h = Math.min(zone.h * 0.95, w * 0.8);
  const s = springIn(f, 0);
  const push = interpolate(f, [0, dur], [1.04, 1.14], clamp);
  return (
    <div style={{ position: "absolute", left: zone.x + zone.w / 2 - w / 2, top: zone.y + zone.h / 2 - h / 2, width: w, height: h, background: "#fff", padding: 14, borderRadius: 18,
      transform: `scale(${s}) rotate(${-2 + wave(f, 120, 1)}deg)`, boxShadow: "0 18px 0 rgba(0,0,0,0.15)" }}>
      <div style={{ width: "100%", height: "100%", overflow: "hidden", borderRadius: 10 }}>
        <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${push})` }} />
      </div>
    </div>
  );
}

// ------------------------------------------------------------------------------------------------ audio plans
/** Music: 0.14 under speech, 0.30 in gaps and the last 40 frames, smoothed over 8 frames. */
export function musicVolumes(total: number, speech: [number, number][]) {
  const raw = new Array(total).fill(0.3);
  for (const [a, b] of speech) for (let f = Math.max(0, a); f < Math.min(total, b); f++) raw[f] = 0.14;
  for (let f = Math.max(0, total - 40); f < total; f++) raw[f] = 0.3;
  return raw.map((_, f) => { let s = 0, n = 0; for (let k = f - 4; k < f + 4; k++) if (k >= 0 && k < total) { s += raw[k]; n++; } return s / n; });
}

type SfxEvent = { at: number; kind: Exclude<Sfx, "none"> };
/** Transition SFX at the transition start; the beat's own sfx; one pop per prop entrance; one tick on emphasis. */
export function planSfx(beats: BeatData[]): SfxEvent[] {
  const out: SfxEvent[] = [];
  const near = (at: number) => out.some((e) => Math.abs(e.at - at) < 6);
  beats.forEach((b, i) => {
    const t: Transition = i === 0 ? "cut" : b.transition ?? "cut";
    const start = b.from - ENTRY[t];
    const own = b.sfx && b.sfx !== "none" ? b.sfx : undefined;
    if (t === "whip") out.push({ at: start, kind: "swipe" });
    else if (t === "zoom" || t === "iris") out.push({ at: start, kind: "whoosh" });
    if (b.layout === "number") out.push({ at: b.from + NUMBER_LAND, kind: own === "ding" ? "ding" : "thud" });
    else if (own && !near(b.from)) out.push({ at: b.from, kind: own });
    if ((b.props?.length || b.photo) && !near(b.from)) out.push({ at: b.from, kind: "pop" });
    const e = b.emph[0];
    if (e !== undefined && !near(e)) out.push({ at: e, kind: "tick" });
  });
  return out.sort((a, b) => a.at - b.at);
}

