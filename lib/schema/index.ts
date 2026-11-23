import { Ajv2020 } from "ajv/dist/2020.js";
import schema from "./video-script.schema.json" with { type: "json" };
import propTags from "./prop-tags.json" with { type: "json" };
import type { Beat, VideoScript } from "./types.ts";

export type * from "./types.ts";
export { schema, propTags };

const ajv = new Ajv2020({ allErrors: true, strict: false });
const validate = ajv.compile<VideoScript>(schema);

const fmt = (e: { instancePath: string; message?: string; params: Record<string, unknown> }) =>
  `${e.instancePath || "/"}: ${e.message}${e.params.additionalProperty ? ` (${e.params.additionalProperty})` : ""}${e.params.allowedValues ? ` (${(e.params.allowedValues as string[]).join(", ")})` : ""}`;

/** Validate a script against the contract. Errors are short, readable lines (fed back to Claude on retry). */
export function validateScript(data: unknown): { ok: true; script: VideoScript } | { ok: false; errors: string[] } {
  if (validate(data)) return { ok: true, script: data };
  return { ok: false, errors: [...new Set((validate.errors ?? []).map(fmt))] };
}

/** All spoken words, in order (length limits, cost estimates and the single voice track). */
export const narrationOf = (s: VideoScript) => s.beats.map((b: Beat) => b.narration.trim().replace(/\s+/g, " ")).join(" ");
export const wordsOf = (t: string) => t.trim().split(/\s+/).filter(Boolean);

/** User photos used by a script (each must be the user's own upload). */
export const photosOf = (s: VideoScript) => s.beats.flatMap((b) => (b.photo ? [b.photo.upload_path] : []));

// ---------------------------------------------------------------- props
export const PROP_TAGS = propTags.map((p) => p.tag);
const TAG_SET = new Set(PROP_TAGS);

/** Registry tag for any tag the model wrote: exact, else nearest by tag word / keyword, else "star". */
export function resolveTag(tag: string) {
  const t = tag.toLowerCase().trim().replace(/[\s-]+/g, "_");
  if (TAG_SET.has(t)) return t;
  const words = t.split("_").filter(Boolean);
  let best = "star", score = 0;
  for (const p of propTags) {
    const s = words.reduce((n, w) => n + (p.tag.split("_").includes(w) ? 3 : 0) + (p.keywords.includes(w) ? 2 : 0)
      + (w.length > 3 && p.keywords.some((k) => k.startsWith(w) || w.startsWith(k)) ? 1 : 0), 0);
    if (s > score) { score = s; best = p.tag; }
  }
  return best;
}

/** The prop list for the script prompt, grouped by category. */
export function propListForPrompt() {
  const by = new Map<string, string[]>();
  for (const p of propTags) by.set(p.category, [...(by.get(p.category) ?? []), p.tag]);
  return [...by].map(([c, tags]) => `${c}: ${tags.join(", ")}`).join("\n");
}

// ---------------------------------------------------------------- length budget
/** Spoken characters per second by language (Malayalam and Tamil words are long and spoken more slowly). */
export const CHARS_PER_SECOND: Record<string, number> = { en: 15, hi: 13, ml: 11, ta: 11 };

/**
 * Narration character budget for a video: what fits the target length (a little over is fine) without passing the
 * hard cap, leaving ~4 s for the tail and the brand end card. Never above the global MAX_NARRATION_CHARS cap.
 */
export function narrationBudget(lang: string, targetSeconds: number, o: { maxVideoSeconds: number; cap: number }) {
  const cps = CHARS_PER_SECOND[lang] ?? 14;
  const room = Math.min(targetSeconds + 5, o.maxVideoSeconds) - 4;
  return Math.max(120, Math.min(o.cap, Math.floor(room * cps)));
}

// ---------------------------------------------------------------- extra checks
export const MIN_WORDS = 3;
export const maxWordsFor = (lang: string) => (lang === "ml" || lang === "ta" ? 7 : 9);
const digits = (s: string) => s.replace(/[^0-9]/g, "");

/**
 * Rules the JSON Schema cannot express (docs/VISUAL_UPGRADE.md §5). Returns readable errors; empty = ok.
 * Also normalises in place: unknown prop tags -> nearest registry tag (never an error), emphasis indexes that point
 * past the words are dropped. `brief` (the user's own words + brand) is used to refuse invented numbers.
 */
export function checkScript(s: VideoScript, opts: { userId: string; maxNarrationChars: number; brief?: string | null }): string[] {
  const errors: string[] = [];
  const chars = narrationOf(s).length;
  if (chars > opts.maxNarrationChars) errors.push(`total narration is ${chars} characters; shorten it to at most ${opts.maxNarrationChars}`);
  const maxW = maxWordsFor(s.language);
  s.beats.forEach((b, i) => {
    const n = wordsOf(b.narration).length;
    if (n < MIN_WORDS || n > maxW) errors.push(`/beats/${i}/narration: ${n} words; use ${MIN_WORDS} to ${maxW} words (split or merge beats)`);
    if (b.emphasis) b.emphasis = [...new Set(b.emphasis.filter((k) => k < n))];
    for (const p of b.props ?? []) p.tag = resolveTag(p.tag);
    for (const node of b.diagram?.nodes ?? []) if (node.tag) node.tag = resolveTag(node.tag);
    if (b.layout === "number" && !b.number) errors.push(`/beats/${i}: layout "number" needs a number {value, label}`);
    if (b.layout === "diagram" && !b.diagram) errors.push(`/beats/${i}: layout "diagram" needs a diagram {kind, nodes}`);
    if (b.layout === "row" && (b.props?.length ?? 0) < 2) errors.push(`/beats/${i}: layout "row" needs 2 or 3 props`);
    if (b.layout === "hero" && (b.props?.length ?? 0) < 1 && !b.photo) errors.push(`/beats/${i}: layout "hero" needs a prop`);
    if (b.number && opts.brief != null && digits(b.number.value) && !digits(opts.brief).includes(digits(b.number.value)))
      errors.push(`/beats/${i}/number: "${b.number.value}" is not in the user's brief; use only numbers the user gave`);
    if (i >= 2 && b.layout === s.beats[i - 1]!.layout && b.layout === s.beats[i - 2]!.layout) errors.push(`/beats/${i}: layout "${b.layout}" three times in a row; vary layouts`);
    const tr = (k: number) => s.beats[k]!.transition ?? "cut";
    if (i >= 3 && tr(i) === tr(i - 1) && tr(i) === tr(i - 2)) errors.push(`/beats/${i}: transition "${tr(i)}" three times in a row; vary transitions`);
  });
  for (const p of photosOf(s)) if (!p.startsWith(`${opts.userId}/`) || p.includes("..")) errors.push("photo upload_path must be one of your own uploads");
  return [...new Set(errors)];
}
