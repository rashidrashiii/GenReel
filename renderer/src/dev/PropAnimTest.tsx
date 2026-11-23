// Review-only: every enter animation side by side (one column each), with idle and the exit shrink at the end.
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { PropView, type Enter, type Idle } from "../components/Prop";
import { makePalette } from "../lib/palette";

const ROWS: { enter: Enter; idle: Idle; tag: string }[] = [
  { enter: "pop", idle: "float", tag: "gift" },
  { enter: "slide_up", idle: "pulse", tag: "train" },
  { enter: "drop", idle: "wobble", tag: "rupee_coin" },
  { enter: "draw_on", idle: "float", tag: "lightbulb" },
  { enter: "wipe_in", idle: "none", tag: "bar_chart" },
];

export function PropAnimTest() {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const pal = makePalette("#1B6B4A");
  return (
    <AbsoluteFill style={{ background: "#DDEFF7" }}>
      {ROWS.map((r, i) => (
        <div key={r.enter} style={{ position: "absolute", left: 290, top: 60 + i * 370, width: 320, height: 320 }}>
          <PropView tag={r.tag} pal={pal} size={320} enter={r.enter} idle={r.idle} f={f - 4} left={durationInFrames - f} phase={i} />
          <div style={{ position: "absolute", left: -260, top: 130, font: "700 34px sans-serif", color: "#1B1F23" }}>{r.enter}<br /><span style={{ fontWeight: 400, fontSize: 26 }}>{r.idle}</span></div>
        </div>
      ))}
      <div style={{ position: "absolute", right: 40, top: 30, font: "800 48px sans-serif", color: "#1B1F23" }}>f{f}</div>
    </AbsoluteFill>
  );
}
