// Review-only: pose contact sheet and a lip-sync test with a real voice clip.
import { AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { Background } from "../components/Background";
import { blinkAt, Presenter, mouthShapes, type MouthShape, type Pose } from "../components/Presenter";
import { makePalette, SKINS } from "../lib/palette";

const POSES: Pose[] = ["neutral", "point", "thumbs_up", "surprised", "explain"];

/** 5 poses x 3 mouth shapes, settled (poseFrame 30) plus one mid-blend row, each skin tone used. */
export function PoseSheet({ primary }: { primary: string }) {
  const cellW = 1080 / 3, cellH = 1920 / 6;
  const cells: { pose: Pose; prev?: Pose; pf: number; mouth: MouthShape; label: string; skin: number }[] = [];
  POSES.forEach((p, i) => cells.push({ pose: p, pf: 40, mouth: 0, label: p, skin: i % SKINS.length }));
  cells.push({ pose: "neutral", pf: 40, mouth: 1, label: "mouth small", skin: 1 });
  cells.push({ pose: "neutral", pf: 40, mouth: 2, label: "mouth wide", skin: 2 });
  ([["neutral", "point"], ["point", "surprised"], ["neutral", "thumbs_up"], ["explain", "point"]] as [Pose, Pose][]).forEach(([a, b], k) =>
    cells.push({ pose: b, prev: a, pf: 3, mouth: 1, label: `${a}→${b} f3`, skin: k % SKINS.length }));
  cells.push({ pose: "neutral", pf: 40, mouth: 0, label: "blink", skin: 3 });
  return (
    <AbsoluteFill style={{ background: "#EEF1EC" }}>
      {cells.map((c, i) => {
        const pal = makePalette(primary, { skin: c.skin });
        const x = (i % 3) * cellW, y = Math.floor(i / 3) * cellH;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: cellW, height: cellH, borderRight: "2px solid #d5dbd4", borderBottom: "2px solid #d5dbd4", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 30, top: 34, width: cellW - 60, height: cellH - 30 }}>
              {/* frame 26 is inside the first seeded blink for seed "host" -> the blink cell shows closed eyes */}
              <Presenter pal={pal} pose={c.pose} prevPose={c.prev} poseFrame={c.pf} frame={c.label === "blink" ? blinkFrame() : 10} mouth={c.mouth} />
            </div>
            <div style={{ position: "absolute", left: 10, top: 6, font: "700 24px sans-serif", color: "#1B1F23" }}>{c.label}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
}

/** First frame where the seeded blink is closed, found by scanning (keeps the sheet honest if the seed changes). */
function blinkFrame() { for (let f = 0; f < 400; f++) if (blinkAt(f, "host")) return f + 1; return 0; }

export type MouthTestProps = { audio: string; mouth: number[]; primary: string };

/** A presenter speaking a real voice clip: mouth from the RMS array, idle motion, a pose change mid-way. */
export function MouthTest({ audio, mouth, primary }: MouthTestProps) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const pal = makePalette(primary);
  const shapes = mouthShapes(mouth);
  const half = Math.floor(durationInFrames / 2);
  const pose: Pose = frame < half ? "explain" : "point";
  return (
    <AbsoluteFill>
      <Background preset="nature" pal={pal} frame={frame} dur={durationInFrames} />
      <div style={{ position: "absolute", left: 270, top: 1170, width: 540, height: 702 }}>
        <Presenter pal={pal} pose={pose} prevPose={frame < half ? "neutral" : "explain"} poseFrame={frame < half ? frame : frame - half} frame={frame} mouth={shapes[frame] ?? 0} />
      </div>
      <div style={{ position: "absolute", left: 60, top: 300, font: "800 64px sans-serif", color: "#1B1F23" }}>rms {(mouth[frame] ?? 0).toFixed(2)} → shape {shapes[frame] ?? 0}</div>
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
}
