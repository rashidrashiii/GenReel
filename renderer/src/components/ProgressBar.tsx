// Thin progress bar at y 200 (docs/VISUAL_UPGRADE.md §4): fills across the whole video.
import { useCurrentFrame, useVideoConfig } from "remotion";
import { toCanvas, ZONES } from "../lib/layout";

export function ProgressBar({ color, track = "rgba(255,255,255,0.35)" }: { color: string; track?: string }) {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const b = toCanvas(ZONES.progress, width, height);
  const p = Math.min(1, frame / Math.max(1, durationInFrames - 1));
  return (
    <div style={{ position: "absolute", left: b.x, top: b.y, width: b.w, height: Math.max(4, b.h), borderRadius: b.h, background: track, overflow: "hidden" }}>
      <div style={{ width: `${p * 100}%`, height: "100%", background: color, borderRadius: b.h }} />
    </div>
  );
}
