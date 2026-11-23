// Presenter (docs/VISUAL_UPGRADE.md §7 "Presenter"): an original, flat, waist-up character in a 400x520 viewBox.
// Arms are two-segment chains computed from joint angles (forward kinematics), so joints can never detach.
// Poses blend with an 8-frame spring; idle breathing, head bob, seeded blinks; mouth from the voice RMS.
import { random } from "remotion";
import type { Palette } from "../lib/palette";
import { mix, shade } from "../lib/palette";
import { springIn, wave } from "../lib/motion";

export type Pose = "neutral" | "point" | "thumbs_up" | "surprised" | "explain";
export type MouthShape = 0 | 1 | 2; // closed smile, small open, wide open
type Hand = "rest" | "point" | "thumb" | "open";
/** Shoulder angle from straight down (outward positive) and elbow bend (positive = forearm turns further outward/up). */
type Arm = { sh: number; el: number; hand: Hand };
type PoseDef = { l: Arm; r: Arm; brow: number; eyes: number };

// "r" is the figure's near arm (screen right before mirroring); `side` mirrors the whole figure.
const POSES: Record<Pose, PoseDef> = {
  neutral: { l: { sh: 14, el: -8, hand: "rest" }, r: { sh: 14, el: -8, hand: "rest" }, brow: 0, eyes: 1 },
  point: { l: { sh: 14, el: -8, hand: "rest" }, r: { sh: 128, el: 22, hand: "point" }, brow: 2, eyes: 1 },
  thumbs_up: { l: { sh: 14, el: -8, hand: "rest" }, r: { sh: 30, el: 125, hand: "thumb" }, brow: 3, eyes: 1 },
  surprised: { l: { sh: 52, el: 108, hand: "open" }, r: { sh: 52, el: 108, hand: "open" }, brow: 9, eyes: 1.25 },
  explain: { l: { sh: 34, el: 92, hand: "open" }, r: { sh: 34, el: 92, hand: "open" }, brow: 3, eyes: 1.05 },
};

const SHOULDER_L = { x: 102, y: 280 }, SHOULDER_R = { x: 298, y: 280 };
const UPPER = 96, FORE = 88, ARM_W = 40;
const NECK = { x: 200, y: 192 };

export type PresenterProps = {
  pal: Palette;
  pose: Pose;
  prevPose?: Pose;
  /** Frames since the pose changed (drives the 8-frame blend). */
  poseFrame: number;
  /** Absolute video frame (idle motion and blinks stay continuous across beats). */
  frame: number;
  mouth: MouthShape;
  /** Frames since the latest emphasis word started (nod + gesture), or a large number if none. */
  emphasisAgo?: number;
  seed?: string;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const blendArm = (a: Arm, b: Arm, t: number): Arm => ({ sh: lerp(a.sh, b.sh, t), el: lerp(a.el, b.el, t), hand: t < 0.5 ? a.hand : b.hand });

/** Seeded blink: closed (scaleY 0.1) for 4 frames every 90..140 frames. */
export function blinkAt(frame: number, seed: string) {
  let t = 25 + Math.floor(random(`${seed}-b0`) * 60);
  for (let k = 1; t <= frame; k++) {
    if (frame < t + 4) return true;
    t += 90 + Math.floor(random(`${seed}-b${k}`) * 51);
  }
  return false;
}

export function Presenter({ pal, pose, prevPose, poseFrame, frame, mouth, emphasisAgo = 999, seed = "host" }: PresenterProps) {
  const from = POSES[prevPose ?? pose], to = POSES[pose];
  const tt = Math.max(0, Math.min(1, springIn(poseFrame, 0, { damping: 14, stiffness: 200, mass: 0.5 })));
  // Emphasis: a 4-degree nod over 6 frames and a small extra lift of the near arm.
  const nod = emphasisAgo >= 0 && emphasisAgo < 6 ? Math.sin((emphasisAgo / 6) * Math.PI) * 4 : 0;
  const lift = emphasisAgo >= 0 && emphasisAgo < 12 ? Math.sin((emphasisAgo / 12) * Math.PI) * 10 : 0;
  const l = blendArm(from.l, to.l, tt);
  const r0 = blendArm(from.r, to.r, tt);
  const r = { ...r0, sh: r0.sh + lift };
  // Idle
  const breathe = 1 + wave(frame, 96, 0.01);
  const bob = wave(frame, 72, 3);
  const tilt = wave(frame, 150, 1.6) + nod;
  const brow = lerp(from.brow, to.brow, tt);
  const eyeScale = lerp(from.eyes, to.eyes, tt) * (blinkAt(frame, seed) ? 0.1 : 1);
  const mouthShape: MouthShape = pose === "surprised" && tt > 0.5 ? (mouth === 0 ? 1 : 2) : mouth;

  // On dark sets the shirt is lifted so the figure does not sink into the night.
  const shirt = pal.dark ? shade(pal.primary, 0.14) : pal.primary, shirtDark = shade(shirt, -0.08), collar = pal.light;
  const skin = pal.skin, skinD = pal.skinShade, hair = pal.hair, ink = pal.ink;

  return (
    <svg viewBox="0 0 400 520" width="100%" height="100%" style={{ overflow: "visible" }}>
      <g transform={`translate(0 ${bob * 0.4})`}>
        <g transform={`translate(200 520) scale(1 ${breathe}) translate(-200 -520)`}>
          <path d="M62 660 L80 312 Q88 248 150 238 L250 238 Q312 248 320 312 L338 660 Z" fill={shirt} />
          <path d="M200 660 L200 290" stroke={shirtDark} strokeWidth={4} strokeLinecap="round" />
          <path d="M154 238 L200 290 L246 238 Z" fill={collar} />
          <path d="M170 238 L200 272 L230 238 Z" fill={skin} />
          <circle cx={200} cy={346} r={6} fill={shirtDark} /><circle cx={200} cy={400} r={6} fill={shirtDark} /><circle cx={200} cy={454} r={6} fill={shirtDark} />
        </g>
        <rect x={180} y={176} width={40} height={70} rx={16} fill={skinD} />
        <g transform={`translate(0 ${bob * 0.6}) rotate(${tilt} ${NECK.x} ${NECK.y})`}>
          <Head skin={skin} skinD={skinD} hair={hair} ink={ink} brow={brow} eyeScale={eyeScale} mouth={mouthShape} />
        </g>
        <ArmChain s={SHOULDER_L} a={l} dir={-1} sleeve={shirtDark} skin={skin} skinD={skinD} />
        <ArmChain s={SHOULDER_R} a={r} dir={1} sleeve={shirtDark} skin={skin} skinD={skinD} />
      </g>
    </svg>
  );
}

function Head({ skin, skinD, hair, ink, brow, eyeScale, mouth }: { skin: string; skinD: string; hair: string; ink: string; brow: number; eyeScale: number; mouth: MouthShape }) {
  const mouthIn = "#5B1F24", teeth = "#FFFFFF", tongue = "#E0707A";
  return (
    <g>
      <path d="M118 120 Q114 40 200 32 Q286 40 282 120 L282 150 Q270 110 200 108 Q130 110 118 150 Z" fill={hair} />
      <ellipse cx={122} cy={128} rx={14} ry={20} fill={skinD} />
      <ellipse cx={278} cy={128} rx={14} ry={20} fill={skinD} />
      <path d="M126 104 Q126 48 200 46 Q274 48 274 104 L274 140 Q272 200 200 206 Q128 200 126 140 Z" fill={skin} />
      <path d="M124 104 Q120 44 196 36 Q262 32 282 92 Q262 70 228 74 Q236 58 214 52 Q200 76 160 80 Q138 84 124 104 Z" fill={hair} />
      <ellipse cx={150} cy={160} rx={16} ry={10} fill={mix(skin, "#E85D75", 0.35)} />
      <ellipse cx={250} cy={160} rx={16} ry={10} fill={mix(skin, "#E85D75", 0.35)} />
      <g transform={`translate(0 ${-brow})`}>
        <rect x={150} y={100} width={36} height={9} rx={4.5} fill={hair} transform={`rotate(${-4 - brow * 0.4} 168 104)`} />
        <rect x={214} y={100} width={36} height={9} rx={4.5} fill={hair} transform={`rotate(${4 + brow * 0.4} 232 104)`} />
      </g>
      {[168, 232].map((x) => (
        <g key={x} transform={`translate(${x} 128) scale(1 ${eyeScale})`}>
          <ellipse rx={10} ry={13} fill={ink} />
          <circle cx={3.5} cy={-5} r={3.6} fill="#FFFFFF" />
        </g>
      ))}
      <ellipse cx={200} cy={150} rx={9} ry={7} fill={skinD} />
      {mouth === 0 && <path d="M180 172 Q200 186 220 172" stroke={mouthIn} strokeWidth={6} strokeLinecap="round" fill="none" />}
      {mouth === 1 && (
        <g>
          <path d="M182 170 Q200 166 218 170 Q216 190 200 192 Q184 190 182 170 Z" fill={mouthIn} />
          <path d="M188 184 Q200 178 212 184 Q206 191 200 191 Q194 191 188 184 Z" fill={tongue} />
        </g>
      )}
      {mouth === 2 && (
        <g>
          <path d="M176 166 Q200 160 224 166 Q222 202 200 204 Q178 202 176 166 Z" fill={mouthIn} />
          <path d="M180 167 Q200 162 220 167 L219 174 Q200 170 181 174 Z" fill={teeth} />
          <path d="M186 194 Q200 184 214 194 Q208 203 200 203 Q192 203 186 194 Z" fill={tongue} />
        </g>
      )}
    </g>
  );
}

/** Upper arm (sleeve) + forearm (skin) + hand, from shoulder angles. `dir` = -1 for the figure's left arm. */
function ArmChain({ s, a, dir, sleeve, skin, skinD }: { s: { x: number; y: number }; a: Arm; dir: 1 | -1; sleeve: string; skin: string; skinD: string }) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const e = { x: s.x + dir * Math.sin(rad(a.sh)) * UPPER, y: s.y + Math.cos(rad(a.sh)) * UPPER };
  const fa = a.sh + a.el;
  const h = { x: e.x + dir * Math.sin(rad(fa)) * FORE, y: e.y + Math.cos(rad(fa)) * FORE };
  const handAngle = Math.atan2(h.y - e.y, h.x - e.x) * (180 / Math.PI) - 90;
  return (
    <g>
      <line x1={e.x} y1={e.y} x2={h.x} y2={h.y} stroke={skin} strokeWidth={ARM_W - 6} strokeLinecap="round" />
      <line x1={s.x} y1={s.y} x2={e.x} y2={e.y} stroke={sleeve} strokeWidth={ARM_W} strokeLinecap="round" />
      {/* thumbs-up is drawn upright on screen (thumb to the sky) whatever the forearm angle */}
      <g transform={`translate(${h.x} ${h.y}) rotate(${a.hand === "thumb" ? 0 : handAngle}) scale(${dir * 1.3} 1.3)`}>
        <HandShape kind={a.hand} skin={skin} skinD={skinD} />
      </g>
    </g>
  );
}

/** Hands in local space: +y points away from the wrist (along the forearm). */
function HandShape({ kind, skin, skinD }: { kind: Hand; skin: string; skinD: string }) {
  if (kind === "point") return (
    <g>
      <rect x={-17} y={-6} width={34} height={34} rx={14} fill={skin} />
      <rect x={-8} y={18} width={13} height={40} rx={6.5} fill={skin} />
      <rect x={10} y={4} width={12} height={20} rx={6} fill={skinD} />
    </g>
  );
  if (kind === "thumb") return (
    <g>
      {/* upright fist above the wrist, knuckles facing out, thumb straight up */}
      <rect x={-19} y={-38} width={38} height={42} rx={14} fill={skin} />
      <path d="M8 -30 V-4 M-2 -30 V-4" stroke={skinD} strokeWidth={3.5} strokeLinecap="round" />
      <rect x={-17} y={-70} width={15} height={40} rx={7.5} fill={skin} />
    </g>
  );
  if (kind === "open") return (
    <g>
      <rect x={-18} y={-4} width={36} height={32} rx={13} fill={skin} />
      {[-12, -4, 4, 12].map((x, i) => <rect key={i} x={x - 4} y={18} width={8.5} height={i === 1 || i === 2 ? 26 : 22} rx={4.25} fill={skin} />)}
      <rect x={-28} y={0} width={10} height={22} rx={5} fill={skin} transform="rotate(30 -23 11)" />
    </g>
  );
  return <circle r={19} fill={skin} />;
}

/** Mouth shapes per frame from the RMS array, with a 2-frame minimum hold (no flicker). */
export function mouthShapes(rms: number[]): MouthShape[] {
  const out: MouthShape[] = [];
  let cur: MouthShape = 0, held = 0;
  for (const v of rms) {
    const want: MouthShape = v < 0.15 ? 0 : v < 0.45 ? 1 : 2;
    if (want !== cur && held >= 2) { cur = want; held = 0; }
    held++;
    out.push(cur);
  }
  return out;
}
