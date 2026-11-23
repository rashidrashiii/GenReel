// One video = one Claude Code session in the project's own folder (~/genreel/projects/<id>/work), then our own
// checks and encode. The session gets the rules as that folder's CLAUDE.md and the approved script in input/brief.json.
import { execFile, spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { copyFile, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, join, normalize } from "node:path";
import { promisify } from "node:util";
import { photosOf, type VideoScript } from "./schema/index.ts";
import { claudeBin, isRateLimit, MAX_VIDEO_SECONDS, RateLimitError } from "./draft.ts";
import { OWNER, paths } from "./paths.ts";

const run = promisify(execFile);
export const SIZES = { "9:16": [1080, 1920], "1:1": [1080, 1080], "16:9": [1920, 1080] } as const;
export type Aspect = keyof typeof SIZES;
export class SessionError extends Error {
  constructor(message: string, readonly userMessage: string, readonly final = false) { super(message); }
}

export type BriefInput = {
  script: VideoScript;
  brand: { name?: string | null; primary_color?: string | null; contact?: string | null; logo_path?: string | null };
  aspect: Aspect;
};

/** Is the lemo-opuscar plugin installed in the user's Claude Code? */
export function hasOpuscar() {
  const f = join(homedir(), ".claude/plugins/installed_plugins.json");
  try { return /lemo-opuscar/.test(readFileSync(f, "utf8")); } catch { return false; }
}

/** Fill the rules template with this machine's folders and the options in use. */
export async function sessionRules(o: { work: string; minutes: number; opuscar: boolean }) {
  let t = await readFile(join(paths.session, "CLAUDE.md"), "utf8");
  // {{#OPUSCAR}}...{{/OPUSCAR}} = steps only when the plugin is installed; {{^OPUSCAR}}...{{/OPUSCAR}} = only when not.
  t = t.replace(/\{\{#OPUSCAR\}\}([\s\S]*?)\{\{\/OPUSCAR\}\}/g, o.opuscar ? "$1" : "")
    .replace(/\{\{\^OPUSCAR\}\}([\s\S]*?)\{\{\/OPUSCAR\}\}/g, o.opuscar ? "" : "$1");
  return t.replaceAll("{{WORK}}", o.work).replaceAll("{{RENDERER}}", paths.renderer).replaceAll("{{ASSETS}}", paths.assets)
    .replaceAll("{{MINUTES}}", String(o.minutes)).replaceAll("{{OPUSCAR_MINUTES}}", String(Math.max(10, o.minutes - 15)));
}

/** Build the work folder: rules, brief.json, the photos the script uses. Clears what a previous run left. */
export async function prepareWork(work: string, b: BriefInput, o: { minutes: number; opuscar: boolean }) {
  await rm(work, { recursive: true, force: true });
  await mkdir(join(work, "input/uploads"), { recursive: true });
  await mkdir(join(work, "out"), { recursive: true });
  const files = [...photosOf(b.script), ...(b.brand.logo_path ? [b.brand.logo_path] : [])];
  for (const f of new Set(files)) {
    const n = normalize(f);
    if (!n.startsWith(`${OWNER}/`) || n.includes("..")) throw new SessionError(`foreign upload ${f}`, "errors.photo", true);
    await mkdir(join(work, "input/uploads", OWNER), { recursive: true });
    await copyFile(join(paths.uploads, basename(n)), join(work, "input/uploads", OWNER, basename(n)));
  }
  const [width, height] = SIZES[b.aspect];
  const brief = {
    script: b.script,
    brand: { name: b.brand.name ?? null, primary_color: b.brand.primary_color || "#1B6B4A", contact: b.brand.contact ?? null, logo_path: b.brand.logo_path ?? null },
    aspect: b.aspect, width, height, language: b.script.language, max_seconds: MAX_VIDEO_SECONDS, music_dir: join(paths.assets, "music"),
  };
  await writeFile(join(work, "input/brief.json"), JSON.stringify(brief, null, 2));
  await writeFile(join(work, "CLAUDE.md"), await sessionRules({ work, ...o }));
}

/** Session percent (0-100 in out/progress.txt) -> job progress 20..90; never goes down. */
export const sessionProgress = (raw: string, prev: number) => {
  const n = Number.parseInt(raw.trim(), 10);
  return Number.isFinite(n) ? Math.max(prev, 20 + Math.round(Math.min(100, Math.max(0, n)) * 0.7)) : prev;
};

export function sessionArgs(model: string, prompt: string) {
  return ["-p", "--permission-mode", "bypassPermissions", "--max-turns", "400", "--model", model, "--output-format", "json", prompt];
}

/** Run the session. onStart gets the pid (so a restarted app can tell a dead job), onUpdate gets stage/progress. */
export async function runSession(work: string, o: {
  model: string; minutes: number; elevenlabsKey: string | null;
  onStart: (pid: number) => void; onUpdate: (u: { stage?: string; progress?: number }) => void; signal?: AbortSignal;
}) {
  const prompt = await readFile(join(paths.session, "prompt.txt"), "utf8");
  const env: NodeJS.ProcessEnv = {
    ...process.env, WORK_DIR: work, GENREEL_ASSETS: paths.assets, GENREEL_VOICES: paths.voices, GENREEL_PYTHON: paths.python,
    ELEVENLABS_API_KEY: o.elevenlabsKey ?? "",
  };
  const p = spawn(claudeBin(), sessionArgs(o.model, prompt), { cwd: work, env, stdio: ["ignore", "pipe", "pipe"], detached: process.platform !== "win32" });
  const kill = () => { try { process.kill(process.platform === "win32" ? p.pid! : -p.pid!, "SIGKILL"); } catch { /* gone */ } };
  let out = "", err = "", last = "", pct = 20, beat = Date.now(), timedOut = false;
  p.stdout.on("data", (d) => (out += d));
  p.stderr.on("data", (d) => (err += d));
  if (p.pid) o.onStart(p.pid);
  const poll = setInterval(async () => {
    const s = (await readFile(join(work, "out/stage.txt"), "utf8").catch(() => "")).trim().slice(0, 80);
    const next = sessionProgress(await readFile(join(work, "out/progress.txt"), "utf8").catch(() => ""), pct);
    // Report changes, and check in every 30 s anyway so the screen can show "last update" while Claude Code works.
    if ((s && s !== last) || next !== pct || Date.now() - beat > 30_000) {
      last = s || last; pct = next; beat = Date.now();
      o.onUpdate({ stage: last || undefined, progress: pct });
    }
  }, 3000);
  const timer = setTimeout(() => { timedOut = true; kill(); }, o.minutes * 60_000);
  o.signal?.addEventListener("abort", kill);
  const code: number | null = await new Promise((r) => { p.on("close", r); p.on("error", () => r(-1)); });
  clearInterval(poll); clearTimeout(timer); o.signal?.removeEventListener("abort", kill);

  let res: { is_error?: boolean; result?: string } = {};
  try { res = JSON.parse(out); } catch { /* killed or crashed */ }
  const userError = (await readFile(join(work, "out/error.txt"), "utf8").catch(() => "")).trim().slice(0, 200);
  if (o.signal?.aborted) throw new SessionError("stopped", "errors.stopped", true);
  if (code === -1) throw new SessionError("claude could not start", "errors.noClaude", true);
  if (timedOut) throw new SessionError("session timed out", "errors.tooSlow");
  if (isRateLimit(`${err}\n${res.is_error ? res.result ?? "" : ""}`) && (code !== 0 || res.is_error)) throw new RateLimitError(`${err}${res.result ?? ""}`.slice(0, 300));
  // prepare.mjs writes out/no_retry when trying again cannot help (script too long).
  if (userError) throw new SessionError(`session gave up: ${userError}`, userError, existsSync(join(work, "out/no_retry")));
  if (code !== 0 || res.is_error || !existsSync(join(work, "out/video.mp4")))
    throw new SessionError(`session failed (exit ${code}): ${err.slice(-300)} ${String(res.result ?? "").slice(0, 300)}`, "errors.failed");
}

type Probe = { streams: { codec_type: string }[]; format: { duration: string; size: string } };
export async function probe(file: string): Promise<Probe> {
  const { stdout } = await run("ffprobe", ["-v", "error", "-show_entries", "stream=codec_type:format=duration,size", "-of", "json", file]);
  return JSON.parse(stdout);
}

/** Never trust session output: check it, then make the final MP4 (H.264 yuv420p Main, AAC, faststart) and a thumbnail. */
export async function finish(work: string, dest: string, aspect: Aspect) {
  const src = join(work, "out/video.mp4");
  const p = await probe(src).catch(() => { throw new SessionError("session output is not a playable video", "errors.failed"); });
  const duration = Number(p.format.duration);
  if (!p.streams.some((s) => s.codec_type === "video") || !p.streams.some((s) => s.codec_type === "audio")) throw new SessionError("output lacks video or audio", "errors.failed");
  if (!(duration > 1 && duration <= MAX_VIDEO_SECONDS + 2)) throw new SessionError(`bad duration ${duration}`, "errors.wrongLength");
  const [w, h] = SIZES[aspect];
  const tmp = join(dest, "video.tmp.mp4");
  await run("ffmpeg", ["-nostdin", "-y", "-v", "error", "-i", src, "-vf", `scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h},setsar=1,fps=30`,
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-profile:v", "main", "-preset", "veryfast", "-crf", "20", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", tmp]);
  const thumb = join(dest, "thumb.jpg");
  await run("ffmpeg", ["-nostdin", "-y", "-v", "error", "-ss", "1", "-i", tmp, "-frames:v", "1", "-vf", "scale=540:-2", thumb]);
  // Replace the previous video only now that the new one is complete.
  await rename(tmp, join(dest, "video.mp4"));
  return { file: "video.mp4", thumb: "thumb.jpg", duration: Math.round(duration * 10) / 10 };
}
