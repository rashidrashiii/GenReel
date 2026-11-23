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

export const MODELS = [
  { id: "claude-sonnet-5-5", label: "Sonnet (faster, uses less of your plan)" },
  { id: "claude-opus-5-5", label: "Opus (best quality, uses more of your plan)" },
];

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
