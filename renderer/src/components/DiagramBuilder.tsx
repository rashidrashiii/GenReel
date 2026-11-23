// DiagramBuilder (docs/VISUAL_UPGRADE.md §7): 2-5 rounded nodes (optional prop icon + fitted label) laid out as a row,
// column or cycle inside the props zone. Node i pops in when its clause is spoken (word timing when available, else
// evenly spaced across the beat); arrows between nodes draw on over 10 frames. Labels never overflow.
import { evolvePath } from "@remotion/paths";
import { interpolate } from "remotion";
import { fitText, fontFor, lineHeightFor } from "../lib/fit";
import { clamp, springIn, wave } from "../lib/motion";
import type { Palette } from "../lib/palette";
import { kit } from "../props/kit";
import { BY_TAG, resolveTag } from "../props/registry";

type Node = { label: string; tag?: string };
type Box = { x: number; y: number; w: number; h: number };

/** Node centres and size for the layout (relative to the zone). */
function layoutNodes(kind: "row" | "column" | "cycle", n: number, z: Box) {
  if (kind === "column") {
    const h = Math.min(z.h / n - 26, 190), w = Math.min(z.w * 0.9, 820);
    return { w, h, pts: Array.from({ length: n }, (_, i) => ({ x: z.x + z.w / 2, y: z.y + (z.h / n) * (i + 0.5) })) };
  }
  if (kind === "cycle") {
    const r = Math.min(z.w, z.h) * 0.34, s = Math.min(270, (2 * Math.PI * r) / n - 60);
    return { w: s, h: s * 0.92, pts: Array.from({ length: n }, (_, i) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / n; return { x: z.x + z.w / 2 + Math.cos(a) * r, y: z.y + z.h / 2 + Math.sin(a) * r }; }) };
  }
  // row: up to 3 in one line; 4-5 wrap into two lines (zig-zag keeps arrows short)
  const perRow = n <= 3 ? n : Math.ceil(n / 2), rows = n <= 3 ? 1 : 2;
  const w = Math.min(z.w / perRow - 44, 290), h = Math.min(z.h / rows - 60, 320);
  return { w, h, pts: Array.from({ length: n }, (_, i) => { const r = Math.floor(i / perRow), c = i % perRow, cols = r === rows - 1 ? n - perRow * r : perRow;
    return { x: z.x + (z.w / cols) * (c + 0.5), y: z.y + (z.h / rows) * (r + 0.5) }; }) };
}

export function DiagramBuilder({ kind, nodes, pal, f, dur, appearAt, zone, lang }: {
  kind: "row" | "column" | "cycle"; nodes: Node[]; pal: Palette; f: number; dur: number; appearAt?: number[]; zone: Box; lang: string;
}) {
  const n = Math.min(5, nodes.length);
  const { w, h, pts } = layoutNodes(kind, n, zone);
  const k = kit(pal);
  const fam = fontFor(lang), lh = lineHeightFor(lang);
  // Even spacing across the first 70% of the beat when no word timing is given.
  const at = (i: number) => appearAt?.[i] ?? Math.round((i * dur * 0.7) / Math.max(1, n));
  const vertical = kind === "column";
  return (
    <>
      {/* arrows first, under the nodes */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
        {pts.slice(0, kind === "cycle" ? n : n - 1).map((a, i) => {
          const b = pts[(i + 1) % n]!;
          const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
          const pad = vertical ? h / 2 + 8 : Math.min(w, h) / 2 + 10;
          const x0 = a.x + (dx / len) * pad, y0 = a.y + (dy / len) * pad, x1 = b.x - (dx / len) * pad, y1 = b.y - (dy / len) * pad;
          const d = `M ${x0} ${y0} L ${x1} ${y1}`;
          const p = interpolate(f, [at(i + 1) - 10, at(i + 1)], [0, 1], clamp);
          if (p <= 0) return null;
          const ang = Math.atan2(y1 - y0, x1 - x0);
          const head = `M ${x1} ${y1} L ${x1 - Math.cos(ang - 0.5) * 26} ${y1 - Math.sin(ang - 0.5) * 26} M ${x1} ${y1} L ${x1 - Math.cos(ang + 0.5) * 26} ${y1 - Math.sin(ang + 0.5) * 26}`;
          return (
            <g key={i} stroke={pal.dark ? "#FFFFFF" : pal.primaryDark} strokeWidth={12} strokeLinecap="round" fill="none">
              <path d={d} {...evolvePath(p, d)} />
              {p >= 1 && <path d={head} />}
            </g>
          );
        })}
      </svg>
      {nodes.slice(0, n).map((node, i) => {
        const pt = pts[i]!;
        const s = springIn(f, at(i));
        if (s <= 0.001) return null;
        const e = node.tag ? BY_TAG.get(resolveTag(node.tag)) : undefined;
        const icon = e ? Math.min(vertical ? h * 0.78 : h * 0.5, w * 0.5) : 0;
        const labW = vertical ? w - icon - 50 : w - 28, labH = vertical ? h - 24 : h - icon - 34;
        const fit = fitText(node.label, { family: fam, weight: 800, maxWidth: labW, maxHeight: labH, maxSize: vertical ? 72 : 60, minSize: 16, maxLines: 2, lineHeight: lh });
        const fresh = f - at(i) < 14;
        return (
          <div key={i} style={{ position: "absolute", left: pt.x - w / 2, top: pt.y - h / 2, width: w, height: h, transform: `scale(${s}) translateY(${wave(f, 70, 4, i)}px)`,
            background: "#FFFFFF", borderRadius: 26, border: `6px solid ${fresh ? pal.accent : pal.primary}`, boxShadow: `0 10px 0 ${pal.primaryDark}`,
            display: "flex", flexDirection: vertical ? "row" : "column", alignItems: "center", justifyContent: "center", gap: vertical ? 18 : 6, padding: 10, boxSizing: "border-box" }}>
            {/* icons sit on a tinted disc so white props (chef hat, cloud, tooth) still show on the white node */}
            {e && <div style={{ flex: "none", width: icon, height: icon, borderRadius: "50%", background: pal.light, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg viewBox="0 0 256 256" width={icon * 0.86} height={icon * 0.86}><e.Art k={k} /></svg>
            </div>}
            <div lang={lang} style={{ textAlign: vertical ? "left" : "center" }}>
              {fit.lines.map((l, j) => <div key={j} style={{ fontFamily: fam, fontWeight: 800, fontSize: fit.size, lineHeight: lh, color: pal.ink, whiteSpace: "nowrap" }}>{l}</div>)}
            </div>
            <div style={{ position: "absolute", top: -22, left: -22, width: 50, height: 50, borderRadius: 25, background: pal.primary, color: "#fff", font: `800 28px ${fontFor("en")}`, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
          </div>
        );
      })}
    </>
  );
}
