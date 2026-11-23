// Backgrounds (docs/VISUAL_UPGRADE.md §7 "Background"): flat SVG layers (sky, far, mid, floor) drawn in a
// 1080x1920 design space, sliced to fill any canvas. Layers drift at different speeds (parallax) and a few shapes
// sway slightly. No blur, no filters. Layout is precomputed per preset (seeded), so frames are cheap.
import { memo, useMemo, type ReactNode } from "react";
import { random } from "remotion";
import type { Palette } from "../lib/palette";
import { hsl, hueDist, mix, shade } from "../lib/palette";
import { wave } from "../lib/motion";

export type BgPreset = "city" | "shop" | "nature" | "studio" | "abstract" | "night";

type Props = { preset: BgPreset; pal: Palette; frame: number; dur: number; dir?: 1 | -1 };

const W = 1080, H = 1920;
const HORIZON = 1260; // where far shapes stand; the presenter's shoulders sit around here

export function Background({ preset, pal, frame, dur, dir = 1 }: Props) {
  const p = Math.min(1, frame / Math.max(1, dur));
  // Parallax: far 20px, mid 30px, floor 40px across the beat, all in the same direction.
  const drift = (px: number) => dir * (p - 0.5) * px;
  const id = `bg-${preset}-${pal.dark ? "d" : "l"}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={pal.sky[0]} />
          <stop offset="1" stopColor={pal.sky[1]} />
        </linearGradient>
      </defs>
      <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={`url(#${id}-sky)`} />
      {preset === "shop" ? <Shop pal={pal} frame={frame} drift={drift} />
        : preset === "nature" ? <Nature pal={pal} frame={frame} drift={drift} />
          : preset === "studio" ? <Studio pal={pal} frame={frame} drift={drift} />
            : preset === "abstract" ? <Abstract pal={pal} frame={frame} drift={drift} />
              : preset === "night" ? <><Stars frame={frame} drift={drift} /><City pal={pal} frame={frame} drift={drift} /></>
                : <City pal={pal} frame={frame} drift={drift} />}
    </svg>
  );
}

const Layer = ({ x, children }: { x: number; children: ReactNode }) => <g transform={`translate(${x} 0)`}>{children}</g>;

// ------------------------------------------------------------------------------------------------ city
type Bld = { x: number; w: number; h: number; tone: number; windows: { x: number; y: number; on: boolean }[] };
function buildings(seed: string, count: number, base: number, minH: number, maxH: number, spanX: [number, number]): Bld[] {
  const out: Bld[] = [];
  let x = spanX[0];
  for (let i = 0; x < spanX[1]; i++) {
    const w = 110 + random(`${seed}w${i}`) * 120;
    const h = minH + random(`${seed}h${i}`) * (maxH - minH);
    const windows: Bld["windows"] = [];
    const cols = Math.max(2, Math.floor((w - 30) / 38)), rows = Math.floor((h - 50) / 56);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++)
      windows.push({ x: x + 18 + c * ((w - 36) / cols), y: base - h + 34 + r * 56, on: random(`${seed}win${i}-${r}-${c}`) > 0.45 });
    out.push({ x, w, h, tone: random(`${seed}t${i}`), windows });
    x += w + 6 + random(`${seed}g${i}`) * 18;
    if (i > count) break;
  }
  return out;
}

const City = memo(function City({ pal, frame, drift }: { pal: Palette; frame: number; drift: (px: number) => number }) {
  const far = useMemo(() => buildings("cityfar", 14, HORIZON, 320, 720, [-80, W + 80]), []);
  const mid = useMemo(() => buildings("citymid", 10, 1480, 180, 420, [-90, W + 90]), []);
  const winOn = pal.dark ? "#FFD979" : mix(pal.far, "#FFFFFF", 0.55);
  const winOff = pal.dark ? shade(pal.far, -0.04) : shade(pal.far, -0.08);
  const midOn = pal.dark ? "#FFE7A3" : mix(pal.mid, "#FFFFFF", 0.5);
  return (
    <>
      {/* sun or moon, slow */}
      <circle cx={820 + drift(10)} cy={470 + wave(frame, 240, 6)} r={pal.dark ? 70 : 96} fill={pal.dark ? "#F4F1DE" : "#FFE08A"} opacity={pal.dark ? 0.9 : 1} />
      <Clouds pal={pal} frame={frame} drift={drift} />
      <Layer x={drift(20)}>
        {far.map((b, i) => (
          <g key={i}>
            <rect x={b.x} y={HORIZON - b.h} width={b.w} height={b.h + 300} rx={6} fill={mix(pal.far, pal.mid, b.tone * 0.35)} />
            {b.windows.map((w, k) => <rect key={k} x={w.x} y={w.y} width={20} height={28} rx={3} fill={w.on ? winOn : winOff} />)}
          </g>
        ))}
      </Layer>
      <Layer x={drift(30)}>
        {mid.map((b, i) => (
          <g key={i}>
            <rect x={b.x} y={1480 - b.h} width={b.w} height={b.h + 200} rx={8} fill={mix(pal.mid, pal.floor, b.tone * 0.3)} />
            {b.windows.filter((_, k) => k % 2 === 0).map((w, k) => <rect key={k} x={w.x} y={w.y + 40} width={24} height={32} rx={4} fill={w.on ? midOn : shade(pal.mid, -0.06)} />)}
          </g>
        ))}
      </Layer>
      <Layer x={drift(40)}>
        <rect x={-100} y={1470} width={W + 200} height={H - 1470 + 60} fill={pal.floor} />
        <rect x={-100} y={1470} width={W + 200} height={16} fill={shade(pal.floor, 0.08)} />
        {Array.from({ length: 10 }, (_, i) => <rect key={i} x={-80 + i * 140} y={1640} width={80} height={14} rx={7} fill={mix(pal.floor, "#FFFFFF", 0.35)} />)}
      </Layer>
    </>
  );
});

const Clouds = ({ pal, frame, drift }: { pal: Palette; frame: number; drift: (px: number) => number }) => {
  const c = pal.dark ? mix(pal.sky[1], "#FFFFFF", 0.12) : "#FFFFFF";
  const cloud = (x: number, y: number, s: number, k: number) => (
    <g key={k} transform={`translate(${x + drift(14) + wave(frame, 300, 8, k)} ${y}) scale(${s})`} opacity={pal.dark ? 0.5 : 0.9}>
      <ellipse cx={0} cy={0} rx={90} ry={34} fill={c} />
      <ellipse cx={-40} cy={-22} rx={46} ry={38} fill={c} />
      <ellipse cx={30} cy={-30} rx={56} ry={46} fill={c} />
    </g>
  );
  return <>{cloud(200, 360, 1, 0)}{cloud(560, 560, 0.7, 1)}{cloud(930, 300, 0.85, 2)}</>;
};

// ------------------------------------------------------------------------------------------------ shop
const Shop = memo(function Shop({ pal, frame, drift }: { pal: Palette; frame: number; drift: (px: number) => number }) {
  const wall = pal.dark ? shade(pal.sky[1], 0.02) : mix(pal.light, pal.sky[1], 0.4);
  const shelf = pal.dark ? shade(pal.far, 0.05) : mix(pal.primaryDark, "#8B5A2B", 0.55);
  const items = useMemo(() => {
    const out: { x: number; y: number; w: number; h: number; c: number; round: boolean }[] = [];
    [520, 790, 1060].forEach((sy, r) => {
      let x = -60;
      for (let i = 0; x < W + 60; i++) {
        const w = 46 + random(`shopw${r}-${i}`) * 50, h = 70 + random(`shoph${r}-${i}`) * 90;
        out.push({ x, y: sy - h, w, h, c: Math.floor(random(`shopc${r}-${i}`) * 6), round: random(`shopr${r}-${i}`) > 0.6 });
        x += w + 10 + random(`shopg${r}-${i}`) * 14;
      }
    });
    return out;
  }, []);
  const colours = [pal.primary, "#F2A541", pal.accent, "#E8655A", mix(pal.accent, "#FFFFFF", 0.4), "#F6D365"];
  const stripes = 12;
  return (
    <>
      <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={wall} />
      <Layer x={drift(20)}>
        {[520, 790, 1060].map((y) => <rect key={y} x={-80} y={y} width={W + 160} height={22} rx={6} fill={shelf} />)}
        {items.map((it, i) => it.round
          ? <g key={i}><rect x={it.x} y={it.y + 18} width={it.w} height={it.h - 18} rx={it.w / 3} fill={colours[it.c]} /><rect x={it.x + it.w * 0.25} y={it.y} width={it.w * 0.5} height={24} rx={6} fill={shade(colours[it.c]!, -0.15)} /></g>
          : <g key={i}><rect x={it.x} y={it.y} width={it.w} height={it.h} rx={8} fill={colours[it.c]} /><rect x={it.x + 8} y={it.y + it.h * 0.35} width={it.w - 16} height={it.h * 0.28} rx={4} fill={mix(colours[it.c]!, "#FFFFFF", 0.6)} /></g>)}
      </Layer>
      {/* awning across the top, gently swaying edge */}
      <Layer x={drift(10)}>
        {Array.from({ length: stripes }, (_, i) => (
          <rect key={i} x={-60 + i * ((W + 120) / stripes)} y={-20} width={(W + 120) / stripes + 1} height={230} fill={i % 2 ? pal.white : pal.primary} />
        ))}
        {Array.from({ length: stripes }, (_, i) => {
          const x = -60 + i * ((W + 120) / stripes), w = (W + 120) / stripes;
          return <path key={`s${i}`} d={`M${x} 210 q ${w / 2} ${46 + wave(frame, 90, 4, i)} ${w} 0 z`} fill={i % 2 ? pal.white : pal.primary} />;
        })}
      </Layer>
      {/* counter */}
      <Layer x={drift(40)}>
        {/* wooden counter: warm, never the brand colour, so the presenter's shirt stands out */}
        <rect x={-100} y={1380} width={W + 200} height={H - 1380 + 60} fill={pal.dark ? "#4A2E1B" : "#B07A4A"} />
        <rect x={-100} y={1360} width={W + 200} height={34} rx={10} fill={pal.dark ? "#6B4428" : "#D39B62"} />
        {Array.from({ length: 6 }, (_, i) => <rect key={i} x={-40 + i * 200} y={1440} width={150} height={360} rx={14} fill={pal.dark ? "#55351F" : "#A06D40"} />)}
      </Layer>
    </>
  );
});

// ------------------------------------------------------------------------------------------------ nature
const Nature = memo(function Nature({ pal, frame, drift }: { pal: Palette; frame: number; drift: (px: number) => number }) {
  // Grass is a light yellow-green; if the brand (shirt) is green too, shift it toward olive/yellow for contrast.
  const nearGreen = Math.abs(hueDist(pal.hue, 120)) < 50;
  const gh = nearGreen ? 72 : 100;
  const green = pal.dark ? "#1E3A2B" : hsl({ h: gh, s: 0.5, l: 0.66 }), green2 = pal.dark ? "#16301F" : hsl({ h: gh, s: 0.45, l: 0.57 }), green3 = pal.dark ? "#10261A" : hsl({ h: gh + 15, s: 0.42, l: 0.42 });
  const trees = useMemo(() => Array.from({ length: 7 }, (_, i) => ({ x: -40 + i * 190 + random(`tx${i}`) * 60, s: 0.8 + random(`ts${i}`) * 0.5, ph: random(`tp${i}`) * 6 })), []);
  const rays = 12;
  return (
    <>
      <g transform={`translate(${780 + drift(8)} 520)`}>
        {!pal.dark && <g transform={`rotate(${frame * 0.4})`}>
          {Array.from({ length: rays }, (_, i) => <rect key={i} x={-8} y={-190} width={16} height={56} rx={8} fill={pal.dark ? "#E8E4C9" : "#FFD34D"} transform={`rotate(${(360 / rays) * i})`} opacity={0.9} />)}
        </g>}
        <circle r={110} fill={pal.dark ? "#F4F1DE" : "#FFD34D"} />
      </g>
      <Clouds pal={pal} frame={frame} drift={drift} />
      <Layer x={drift(20)}>
        <path d={`M-100 ${HORIZON} Q 160 ${HORIZON - 340} 420 ${HORIZON - 120} T 900 ${HORIZON - 260} T 1300 ${HORIZON - 80} V ${H} H -100 Z`} fill={green} />
      </Layer>
      <Layer x={drift(30)}>
        <path d={`M-100 ${HORIZON + 140} Q 260 ${HORIZON - 60} 620 ${HORIZON + 80} T 1300 ${HORIZON + 20} V ${H} H -100 Z`} fill={green2} />
        {trees.map((t, i) => (
          <g key={i} transform={`translate(${t.x} ${HORIZON + 120}) scale(${t.s}) rotate(${wave(frame, 110, 1, t.ph)} 0 0)`}>
            <rect x={-12} y={-150} width={24} height={150} rx={10} fill={pal.dark ? "#2B2017" : "#7A5230"} />
            <circle cx={0} cy={-190} r={78} fill={green3} />
            <circle cx={-46} cy={-150} r={54} fill={green3} />
            <circle cx={48} cy={-152} r={56} fill={shade(green3, 0.06)} />
          </g>
        ))}
      </Layer>
      <Layer x={drift(40)}>
        <path d={`M-100 1520 Q 540 1430 1180 1520 V ${H + 60} H -100 Z`} fill={pal.dark ? "#0C1D13" : green2} />
        {Array.from({ length: 14 }, (_, i) => (
          <path key={i} d={`M ${-40 + i * 85} 1560 q 6 -${30 + (i % 3) * 10} 12 0`} stroke={pal.dark ? "#1E3A2B" : green3} strokeWidth={6} strokeLinecap="round" fill="none"
            transform={`rotate(${wave(frame, 70, 4, i)} ${-34 + i * 85} 1560)`} />
        ))}
      </Layer>
    </>
  );
});

// ------------------------------------------------------------------------------------------------ studio
const Studio = memo(function Studio({ pal, frame, drift }: { pal: Palette; frame: number; drift: (px: number) => number }) {
  const wall = pal.dark ? "#1F2A3A" : mix(pal.light, "#FFFFFF", 0.4);
  const panel = pal.dark ? "#2C3B50" : mix(pal.primary, "#FFFFFF", 0.7);
  return (
    <>
      <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={wall} />
      <Layer x={drift(20)}>
        {[0, 1, 2, 3].map((i) => {
          const glow = 0.55 + 0.45 * Math.max(0, Math.sin((frame / 40) * Math.PI + i * 1.3));
          return <rect key={i} x={-40 + i * 300} y={300} width={220} height={760} rx={28} fill={panel} opacity={glow} />;
        })}
      </Layer>
      <Layer x={drift(30)}>
        <circle cx={540} cy={1180} r={520} fill={pal.dark ? "#2A3A52" : "#FFFFFF"} opacity={0.6} />
        <circle cx={540} cy={1180} r={440 + wave(frame, 80, 10)} fill="none" stroke={mix(pal.primary, "#FFFFFF", 0.45)} strokeWidth={22} opacity={0.7} />
      </Layer>
      <Layer x={drift(40)}>
        <rect x={-100} y={1420} width={W + 200} height={H - 1420 + 60} fill={pal.dark ? "#141C28" : mix(pal.primary, "#FFFFFF", 0.55)} />
        <rect x={-100} y={1420} width={W + 200} height={10} fill={pal.dark ? "#33445E" : mix(pal.primary, "#FFFFFF", 0.5)} />
      </Layer>
    </>
  );
});

// ------------------------------------------------------------------------------------------------ abstract
const Abstract = memo(function Abstract({ pal, frame, drift }: { pal: Palette; frame: number; drift: (px: number) => number }) {
  const bg = pal.dark ? "#162033" : mix(pal.light, pal.accent, 0.12);
  const c1 = pal.dark ? "#25365A" : mix(pal.accent, "#FFFFFF", 0.55), c2 = pal.dark ? "#1E2B47" : mix(pal.primary, "#FFFFFF", 0.7);
  const blobs = useMemo(() => Array.from({ length: 7 }, (_, i) => ({ x: random(`abx${i}`) * W, y: 200 + random(`aby${i}`) * 1400, r: 90 + random(`abr${i}`) * 220, ph: random(`abp${i}`) * 6 })), []);
  return (
    <>
      <rect x={-60} y={-60} width={W + 120} height={H + 120} fill={bg} />
      <Layer x={drift(20)}>
        {blobs.map((b, i) => <circle key={i} cx={b.x + wave(frame, 90, 70, b.ph)} cy={b.y + wave(frame, 110, 80, b.ph + 1)} r={b.r * (1 + wave(frame, 70, 0.12, b.ph))} fill={i % 2 ? c1 : c2} opacity={0.85} />)}
      </Layer>
      <Layer x={drift(40)}>
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M-100 ${1300 + i * 120} Q 170 ${1240 + i * 120 + wave(frame, 60, 60, i)} 540 ${1300 + i * 120} T 1180 ${1300 + i * 120} V ${H + 60} H -100 Z`}
            fill={i === 0 ? c1 : i === 1 ? c2 : (pal.dark ? "#121A2B" : mix(pal.primary, "#FFFFFF", 0.55))} opacity={0.9} />
        ))}
      </Layer>
    </>
  );
});

// ------------------------------------------------------------------------------------------------ night stars
const Stars = memo(function Stars({ frame, drift }: { frame: number; drift: (px: number) => number }) {
  const stars = useMemo(() => Array.from({ length: 60 }, (_, i) => ({ x: random(`sx${i}`) * W, y: random(`sy${i}`) * 900, r: 2 + random(`sr${i}`) * 4, ph: random(`sp${i}`) * 6, sp: 30 + random(`ss${i}`) * 50 })), []);
  return (
    <g transform={`translate(${drift(8)} 0)`}>
      {stars.map((st, i) => <circle key={i} cx={st.x} cy={st.y} r={st.r} fill="#FFFFFF" opacity={0.35 + 0.65 * Math.abs(Math.sin((frame / st.sp) * Math.PI + st.ph))} />)}
    </g>
  );
});
