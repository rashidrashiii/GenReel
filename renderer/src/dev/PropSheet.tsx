// Review-only still: every registered prop with its tag, on light and dark tiles (docs/VISUAL_UPGRADE.md §7).
import { AbsoluteFill } from "remotion";
import { kit } from "../props/kit";
import { REGISTRY } from "../props/registry";
import { makePalette } from "../lib/palette";

export function PropSheet({ primary, from = 0, count = 48 }: { primary: string; from?: number; count?: number }) {
  const pal = makePalette(primary);
  const k = kit(pal);
  const items = REGISTRY.slice(from, from + count);
  const cols = 6, cell = 1080 / cols;
  return (
    <AbsoluteFill style={{ background: "#EEF1EC" }}>
      {items.map((e, i) => {
        const x = (i % cols) * cell, y = Math.floor(i / cols) * (cell + 34);
        const dark = Math.floor(i / cols) % 2 === 1 && i % 2 === 0; // a few tiles on a dark set to check contrast
        return (
          <div key={e.tag} style={{ position: "absolute", left: x, top: y, width: cell, height: cell + 34, background: dark ? "#1B2A3A" : undefined, borderRight: "1px solid #d5dbd4", borderBottom: "1px solid #d5dbd4" }}>
            <svg viewBox="0 0 256 256" width={cell - 24} height={cell - 24} style={{ position: "absolute", left: 12, top: 8 }}><e.Art k={k} /></svg>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 6, textAlign: "center", font: "600 20px sans-serif", color: dark ? "#fff" : "#1B1F23" }}>{e.tag}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
}
