// Motion helpers (docs/VISUAL_UPGRADE.md §7, §9). Everything is a pure function of frame numbers.
import { Easing, interpolate, random, spring } from "remotion";

export const FPS = 30;
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const easeOut = Easing.out(Easing.cubic);
export const easeIn = Easing.in(Easing.cubic);
export const easeInOut = Easing.inOut(Easing.cubic);

/** 0..1 over [a, b] (clamped), optional easing. */
export const progress = (frame: number, a: number, b: number, easing = easeOut) =>
  b <= a ? (frame >= b ? 1 : 0) : interpolate(frame, [a, b], [0, 1], { ...clamp, easing });

/** Spring 0 -> 1 (with overshoot) starting at `delay`. */
export const springIn = (frame: number, delay = 0, config: { damping?: number; stiffness?: number; mass?: number } = {}) =>
  spring({ frame: frame - delay, fps: FPS, config: { damping: 12, stiffness: 180, mass: 0.6, ...config } });

/** Smooth seeded noise in -1..1 (value noise with cosine interpolation), deterministic per seed. */
export function noise(seed: string, t: number) {
  const i = Math.floor(t), f = t - i, k = (1 - Math.cos(f * Math.PI)) / 2;
  const a = random(`${seed}:${i}`) * 2 - 1, b = random(`${seed}:${i + 1}`) * 2 - 1;
  return a + (b - a) * k;
}

/** Sine wave helper: amplitude * sin(2π frame / period + phase). */
export const wave = (frame: number, period: number, amplitude: number, phase = 0) => amplitude * Math.sin((2 * Math.PI * frame) / period + phase);
