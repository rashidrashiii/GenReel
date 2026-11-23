import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { paths } from "./paths";

export type Settings = {
  elevenlabsKey: string | null; // optional; only ever sent to ElevenLabs
  scriptModel: string;
  videoModel: string;
  language: "en" | "ml" | "hi" | "ta";
  videoMinutes: number; // time limit for one video session
};

/** Models offered in Settings (current Claude models; any other ID can be typed in as a custom model). */
export const MODELS = [
  { id: "claude-sonnet-5-5", name: "Sonnet 5.5", note: "Fast and capable. A good default for scripts and videos.", speed: "Fast", use: "Moderate" },
  { id: "claude-opus-5-5", name: "Opus 5.5", note: "Richer, more polished videos. Takes longer.", speed: "Slower", use: "High" },
  { id: "claude-fable-5-2", name: "Fable 5.2", note: "Anthropic's most capable model. Slowest; may not be included in every plan.", speed: "Slowest", use: "Highest" },
  { id: "claude-haiku-5-5", name: "Haiku 5.5", note: "Quickest and lightest. Fine for scripts; videos come out simpler.", speed: "Fastest", use: "Low" },
  { id: "claude-opus-5", name: "Opus 5", note: "The previous Opus.", speed: "Slower", use: "High", older: true },
  { id: "claude-sonnet-5", name: "Sonnet 5", note: "The previous Sonnet.", speed: "Fast", use: "Moderate", older: true },
];
/** A model ID typed in by hand: Claude Code's --model accepts more than the list above. */
export const isModelId = (s: string) => /^claude-[a-z0-9][a-z0-9.-]{1,60}$/.test(s);

const DEFAULTS: Settings = { elevenlabsKey: null, scriptModel: "claude-sonnet-5-5", videoModel: "claude-sonnet-5-5", language: "en", videoMinutes: 60 };

export async function getSettings(): Promise<Settings> {
  const raw = await readFile(paths.settings, "utf8").catch(() => "{}");
  let s: Partial<Settings> = {};
  try { s = JSON.parse(raw); } catch { /* broken file: defaults */ }
  return { ...DEFAULTS, ...s };
}

export async function saveSettings(patch: Partial<Settings>) {
  const next = { ...(await getSettings()), ...patch };
  await mkdir(dirname(paths.settings), { recursive: true });
  await writeFile(paths.settings, JSON.stringify(next, null, 2), { mode: 0o600 });
  await chmod(paths.settings, 0o600); // the file may predate the mode option
  return next;
}

/** What the browser may see: never the key itself. */
export const publicSettings = (s: Settings) => ({ ...s, elevenlabsKey: null, hasElevenlabsKey: Boolean(s.elevenlabsKey) });

/** Malayalam and Tamil have no free local voice; they need an ElevenLabs key. */
export const LOCAL_VOICE_LANGS = ["en", "hi"];
export const languageAvailable = (lang: string, s: Settings) => LOCAL_VOICE_LANGS.includes(lang) || Boolean(s.elevenlabsKey);
