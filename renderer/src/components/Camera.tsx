// Camera (docs/VISUAL_UPGRADE.md §7): wraps a beat's content; every beat moves. Origin at the centre.
import type { ReactNode } from "react";
import { interpolate } from "remotion";
import { clamp, easeOut, easeInOut, noise } from "../lib/motion";

export type CameraKind = "push_in" | "pull_out" | "pan_left" | "pan_right" | "shake_punch" | "none";

/** Transform for a camera move at `frame` (0 = beat start) over `dur` frames. "none" still breathes slightly. */
export function cameraTransform(kind: CameraKind | undefined, frame: number, dur: number, seed: string) {
  const d = Math.max(2, dur);
  switch (kind ?? "push_in") {
    case "pull_out": {
      const s = interpolate(frame, [0, d], [1.1, 1], { ...clamp, easing: easeOut });
      return `scale(${s})`;
    }
    case "pan_left":
    case "pan_right": {
      const dir = kind === "pan_left" ? -1 : 1;
      const x = interpolate(frame, [0, d], [-40 * dir, 40 * dir], { ...clamp, easing: easeInOut });
      return `translateX(${x}px) scale(1.06)`;
    }
    case "shake_punch": {
      const s = frame < 5 ? interpolate(frame, [0, 5], [1, 1.12], { ...clamp, easing: easeOut }) : interpolate(frame, [5, 15], [1.12, 1.02], { ...clamp, easing: easeOut });
      const amp = 6 * Math.max(0, 1 - frame / 18);
      const dx = noise(`${seed}x`, frame / 1.5) * amp, dy = noise(`${seed}y`, frame / 1.5) * amp;
      return `translate(${dx}px, ${dy}px) scale(${s})`;
    }
    case "none": {
      const s = interpolate(frame, [0, d], [1.0, 1.03], clamp); // never fully still
      return `scale(${s})`;
    }
    default: {
      const s = interpolate(frame, [0, d], [1, 1.08], { ...clamp, easing: easeOut });
      return `scale(${s})`;
    }
  }
}

export function Camera({ kind, frame, dur, seed, children }: { kind?: CameraKind; frame: number; dur: number; seed: string; children: ReactNode }) {
  return (
    <div style={{ position: "absolute", inset: 0, transformOrigin: "50% 50%", transform: cameraTransform(kind, frame, dur, seed) }}>
      {children}
    </div>
  );
}
