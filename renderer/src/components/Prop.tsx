// Prop animation (docs/VISUAL_UPGRADE.md §7 "Props"): enter, idle, exit; and PropLayer, which places 1-3 props
// in the props zone with a 5-frame stagger (or at the frame their word is spoken).
import { evolvePath } from "@remotion/paths";
import { interpolate } from "remotion";
import type { Palette } from "../lib/palette";
import { clamp, easeIn, easeOut, springIn, wave } from "../lib/motion";
import { kit } from "../props/kit";
import { BY_TAG, resolveTag } from "../props/registry";

export type Enter = "pop" | "slide_up" | "drop" | "draw_on" | "wipe_in";
export type Idle = "float" | "pulse" | "wobble" | "none";
export type PropSpec = { tag: string; enter?: Enter; idle?: Idle };

/** Transform/clip for a prop `f` frames after it appears, in a beat that ends `left` frames from now. */
export function propMotion(enter: Enter, idle: Idle, f: number, left: number, phase = 0) {
  let tx = 0, ty = 0, scale = 1, rot = 0, clip: string | undefined;
  if (f < 0) return { hidden: true as const };
  switch (enter) {
    case "pop": scale = springIn(f, 0, { damping: 12, stiffness: 180, mass: 0.6 }); break;
    case "slide_up": ty = interpolate(f, [0, 12], [200, 0], { ...clamp, easing: easeOut }); scale = interpolate(f, [0, 12], [0.9, 1], clamp); break;
    case "drop": {
      // Fall from -300 (accelerating), one bounce, settle.
      ty = f < 10 ? interpolate(f, [0, 10], [-300, 0], { ...clamp, easing: easeIn })
        : f < 18 ? -Math.sin(((f - 10) / 8) * Math.PI) * 40 : 0;
      scale = f >= 10 && f < 13 ? 1 - 0.08 * Math.sin(((f - 10) / 3) * Math.PI) : 1; // squash on landing
      break;
    }
    case "draw_on": scale = interpolate(f, [0, 14], [0.6, 1], { ...clamp, easing: easeOut }); clip = `circle(${interpolate(f, [0, 14], [0, 75], { ...clamp, easing: easeOut })}% at 50% 55%)`; break;
    case "wipe_in": clip = `inset(0 ${interpolate(f, [0, 10], [100, 0], { ...clamp, easing: easeOut })}% 0 0)`; break;
  }
  // Idle starts once the entrance is mostly done.
  const idleF = Math.max(0, f - 12);
  if (idle === "float") ty += wave(idleF, 60, 8, phase);
  if (idle === "pulse") scale *= 1 + wave(idleF, 40, 0.03, phase);
  if (idle === "wobble") rot += wave(idleF, 50, 3, phase);
  // Exit: shrink over the last 6 frames of the beat.
  if (left < 6) scale *= interpolate(left, [0, 6], [0, 1], { ...clamp, easing: easeIn });
  return { hidden: false as const, tx, ty, scale, rot, clip, drawOn: enter === "draw_on" ? Math.min(1, f / 14) : 1 };
}

const RING = "M 128 14 A 114 114 0 1 1 127.9 14";

export function PropView({ tag, pal, size, enter = "pop", idle = "float", f, left, phase = 0 }: { tag: string; pal: Palette; size: number; enter?: Enter; idle?: Idle; f: number; left: number; phase?: number }) {
  const e = BY_TAG.get(resolveTag(tag));
  const m = propMotion(enter, idle, f, left, phase);
  if (!e || m.hidden) return null;
  const k = kit(pal);
  return (
    <div style={{ width: size, height: size, transform: `translate(${m.tx}px, ${m.ty}px) rotate(${m.rot}deg) scale(${m.scale})`, transformOrigin: "50% 80%", clipPath: m.clip }}>
      <svg viewBox="0 0 256 256" width={size} height={size} style={{ overflow: "visible" }}>
        <e.Art k={k} />
        {m.drawOn < 1 && <path d={RING} fill="none" stroke={pal.accent} strokeWidth={8} strokeLinecap="round" {...evolvePath(m.drawOn, RING)} />}
      </svg>
    </div>
  );
}

/** Sizes and centres (design px, inside the props zone 960x620) for 1-3 props. */
export function propSlots(n: number): { cx: number; cy: number; size: number }[] {
  if (n <= 1) return [{ cx: 480, cy: 330, size: 440 }];
  if (n === 2) return [{ cx: 250, cy: 340, size: 380 }, { cx: 710, cy: 320, size: 380 }];
  return [{ cx: 170, cy: 370, size: 300 }, { cx: 480, cy: 260, size: 320 }, { cx: 790, cy: 370, size: 300 }];
}

/**
 * All props of a beat in the props zone. `f` = frames since the beat started; `appearAt[i]` = frame (beat-relative)
 * where prop i's word is spoken, if known; else start + 5-frame stagger.
 */
export function PropLayer({ props, pal, f, dur, appearAt, zone, scale = 1 }: {
  props: PropSpec[]; pal: Palette; f: number; dur: number; appearAt?: (number | undefined)[];
  zone: { x: number; y: number; w: number; h: number }; scale?: number;
}) {
  const slots = propSlots(props.length);
  const k = zone.w / 960;
  return (
    <>
      {props.slice(0, 3).map((p, i) => {
        const s = slots[i]!;
        const size = s.size * k * scale;
        const start = Math.max(i * 5, appearAt?.[i] ?? i * 5);
        return (
          <div key={i} style={{ position: "absolute", left: zone.x + s.cx * k - size / 2, top: zone.y + s.cy * (zone.h / 620) - size / 2, width: size, height: size }}>
            <PropView tag={p.tag} pal={pal} size={size} enter={p.enter} idle={p.idle ?? "float"} f={f - start} left={dur - f} phase={i * 1.7} />
          </div>
        );
      })}
    </>
  );
}
