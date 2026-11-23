// First-run checks and the installs genreel can do by itself (nothing here needs admin rights).
// Claude Code, ffmpeg and Python are the user's to install; the Setup page shows how.
import { execFile, spawn } from "node:child_process";
import { createWriteStream, existsSync } from "node:fs";
import { cp, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { promisify } from "node:util";
import { claudeBin } from "./draft.ts";
import { paths } from "./paths.ts";
import { hasOpuscar } from "./session.ts";

const run = promisify(execFile);
const KOKORO_PIP = "kokoro-onnx==0.6.1"; // needs Python 3.10-3.13
const KOKORO_FILES = {
  "kokoro-v1.0.onnx": "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx",
  "voices-v1.0.bin": "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin",
};

export type Check = { id: string; ok: boolean; required: boolean; detail: string | null };

async function version(cmd: string, args: string[]) {
  try { const { stdout, stderr } = await run(cmd, args, { timeout: 15_000 }); return `${stdout}${stderr}`.trim(); } catch { return null; }
}
const major = (s: string | null, re: RegExp) => Number(re.exec(s ?? "")?.[1] ?? 0);
/** The first Python 3.10-3.13 on PATH (many Macs have an old python3 first). */
async function findPython(): Promise<{ cmd: string; version: string } | null> {
  const names = process.platform === "win32" ? ["py -3.12", "py -3.11", "py -3.13", "py -3.10", "python"] : ["python3.12", "python3.11", "python3.13", "python3.10", "python3"];
  for (const n of names) {
    const [cmd, ...args] = n.split(" ");
    const v = await version(cmd!, [...args, "--version"]);
    const m = /Python 3\.(\d+)/.exec(v ?? "");
    if (m && Number(m[1]) >= 10 && Number(m[1]) <= 13) return { cmd: n, version: v! };
  }
  return null;
}
const venvPython = () => (process.platform === "win32" ? join(paths.python, "Scripts", "python.exe") : join(paths.python, "bin", "python"));
const rendererVersionFile = join(paths.renderer, ".genreel-version");

async function appVersion() {
  return JSON.parse(await readFile(join(paths.rendererSrc, "..", "package.json"), "utf8")).version as string;
}

export async function checks(): Promise<Check[]> {
  const [claude, ffmpeg, python] = await Promise.all([version(claudeBin(), ["--version"]), version("ffmpeg", ["-version"]), findPython()]);
  const ff = major(ffmpeg, /ffmpeg version n?(\d+)/);
  const rendererOk = existsSync(join(paths.renderer, "node_modules/.bin/remotion"))
    && (await readFile(rendererVersionFile, "utf8").catch(() => "")) === (await appVersion());
  const voiceOk = existsSync(venvPython()) && Object.keys(KOKORO_FILES).every((f) => existsSync(join(paths.voices, f)));
  return [
    { id: "claude", ok: Boolean(claude), required: true, detail: claude?.split("\n")[0] ?? null },
    { id: "node", ok: Number(process.versions.node.split(".")[0]) >= 20, required: true, detail: process.versions.node },
    { id: "ffmpeg", ok: ff >= 6, required: true, detail: ffmpeg ? `ffmpeg ${ff}` : null },
    { id: "python", ok: Boolean(python), required: false, detail: python?.version ?? null },
    { id: "renderer", ok: rendererOk, required: true, detail: null },
    { id: "voice", ok: voiceOk, required: false, detail: null },
    { id: "opuscar", ok: hasOpuscar(), required: false, detail: ffmpeg && ff < 7 ? "needs ffmpeg 7" : null },
  ];
}

export const ready = (cs: Check[]) => cs.filter((c) => c.required).every((c) => c.ok);

// ------------------------------------------------------------------ installs (one at a time, status polled by the page)
type Task = { step: string; status: "running" | "done" | "failed"; log: string; started: string };
const g = globalThis as unknown as { __genreelSetup?: { task: Task | null } };
const S = (g.__genreelSetup ??= { task: null });
export const currentTask = () => S.task;

function sh(task: Task, cmd: string, args: string[], cwd?: string) {
  return new Promise<void>((resolve, reject) => {
    task.log += `\n$ ${cmd} ${args.join(" ")}\n`;
    const p = spawn(cmd, args, { cwd, env: process.env, stdio: ["ignore", "pipe", "pipe"], shell: process.platform === "win32" });
    const add = (d: Buffer) => { task.log = (task.log + d.toString()).slice(-6000); };
    p.stdout.on("data", add); p.stderr.on("data", add);
    p.on("error", reject);
    p.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
  });
}

async function download(task: Task, url: string, dest: string) {
  task.log += `\ndownloading ${url}\n`;
  const r = await fetch(url, { redirect: "follow" });
  if (!r.ok || !r.body) throw new Error(`download failed: ${r.status}`);
  const tmp = `${dest}.part`;
  await pipeline(Readable.fromWeb(r.body as never), createWriteStream(tmp));
  await rename(tmp, dest);
}

const STEPS: Record<string, (t: Task) => Promise<void>> = {
  /** Copy the app's Remotion project to ~/genreel/renderer, install its packages and its own headless browser. */
  async renderer(t) {
    await mkdir(paths.renderer, { recursive: true });
    await cp(paths.rendererSrc, paths.renderer, { recursive: true, force: true, filter: (src) => !/[/\\](node_modules|out)([/\\]|$)/.test(src) });
    await sh(t, "npm", ["ci", "--no-audit", "--no-fund"], paths.renderer);
    // The renderer's own CLI, not npx: npx can resolve packages from somewhere else.
    await sh(t, process.execPath, [join(paths.renderer, "node_modules/@remotion/cli/remotion-cli.js"), "browser", "ensure"], paths.renderer);
    await writeFile(rendererVersionFile, await appVersion());
  },
  /** A private Python environment with Kokoro, and its two model files (about 340 MB). */
  async voice(t) {
    const py = await findPython();
    if (!py) throw new Error("Python 3.10 to 3.13 is needed for the free voice");
    const [cmd, ...pre] = py.cmd.split(" ");
    if (!existsSync(venvPython())) await sh(t, cmd!, [...pre, "-m", "venv", paths.python]);
    await sh(t, venvPython(), ["-m", "pip", "install", "--quiet", "--upgrade", "pip"]);
    await sh(t, venvPython(), ["-m", "pip", "install", "--quiet", KOKORO_PIP]);
    await mkdir(paths.voices, { recursive: true });
    for (const [f, url] of Object.entries(KOKORO_FILES)) if (!existsSync(join(paths.voices, f))) await download(t, url, join(paths.voices, f));
  },
  /** The lemo-opuscar plugin for richer animation (installed into the user's own Claude Code, with their consent). */
  async opuscar(t) {
    await sh(t, claudeBin(), ["plugin", "marketplace", "add", "lemomo-ai/lemo-opuscar"]).catch(() => { t.log += "(marketplace may already be added)\n"; });
    await sh(t, claudeBin(), ["plugin", "install", "lemo-opuscar@lemolab"]);
  },
};

export function startInstall(step: string) {
  if (!STEPS[step]) return "errors.invalid";
  if (S.task?.status === "running") return "errors.busy";
  const task: Task = { step, status: "running", log: "", started: new Date().toISOString() };
  S.task = task;
  void STEPS[step](task).then(() => { task.status = "done"; }, async (e) => {
    task.status = "failed";
    task.log += `\n${e instanceof Error ? e.message : e}\n`;
    if (step === "renderer") await rm(rendererVersionFile, { force: true });
  });
  return null;
}
