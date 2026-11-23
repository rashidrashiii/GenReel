// The job runner inside the local server: drafts run right away, videos one at a time (each one is a long
// Claude Code session on the user's own plan). State lives in each project.json, so a restart loses nothing but
// the job that was running, which is marked failed with a "Try again" button.
import { join } from "node:path";
import { writeScript, RateLimitError } from "./draft.ts";
import { getSettings } from "./settings.ts";
import { finish, hasOpuscar, prepareWork, runSession, SessionError } from "./session.ts";
import { getProject, listProjects, newJob, patchJob, projectDir, updateProject } from "./store.ts";

type Runner = { queue: string[]; current: { id: string; abort: AbortController } | null; recovered: boolean };
// One runner per server process, also across dev hot reloads.
const g = globalThis as unknown as { __genreelRunner?: Runner };
const R: Runner = (g.__genreelRunner ??= { queue: [], current: null, recovered: false });

const userMessage = (e: unknown) =>
  e instanceof RateLimitError ? "errors.limit" : e instanceof SessionError ? e.userMessage : (e as { userMessage?: string })?.userMessage ?? "errors.failed";

const fail = (id: string, e: unknown) => {
  console.error(`[genreel] ${id}:`, e instanceof Error ? e.message : e);
  return updateProject(id, (p) => {
    p.state = "failed";
    if (p.job) p.job = { ...p.job, status: "failed", error: userMessage(e), pid: null };
  });
};

export async function startDraft(id: string) {
  await updateProject(id, (p) => { p.state = "draft_pending"; p.job = { ...newJob("draft"), status: "running", stage: "Writing the script", progress: 10 }; });
  void (async () => {
    try {
      const p = await getProject(id);
      if (!p) return;
      const s = await getSettings();
      const script = await writeScript(p, { model: s.scriptModel });
      await updateProject(id, (q) => {
        q.scenes = script; q.title = script.title; q.state = "draft_ready";
        if (q.job) q.job = { ...q.job, status: "done", progress: 100, stage: "Done" };
      });
    } catch (e) { await fail(id, e); }
  })();
}

export async function enqueueRender(id: string) {
  await updateProject(id, (p) => { p.state = "render_pending"; p.job = newJob("render"); });
  if (!R.queue.includes(id)) R.queue.push(id);
  void pump();
}

/** Position in line (1 = next), 0 when running or not queued. */
export const queuePosition = (id: string) => R.queue.indexOf(id) + 1;

export function stopRender(id: string) {
  R.queue = R.queue.filter((q) => q !== id);
  if (R.current?.id === id) R.current.abort.abort();
}

async function pump() {
  if (R.current || !R.queue.length) return;
  const id = R.queue.shift()!;
  const abort = new AbortController();
  R.current = { id, abort };
  try {
    await renderOne(id, abort.signal);
  } catch (e) {
    await fail(id, e);
  } finally {
    R.current = null;
    void pump();
  }
}

async function renderOne(id: string, signal: AbortSignal) {
  const p = await getProject(id);
  if (!p?.scenes) throw new SessionError("no script", "errors.failed", true);
  const s = await getSettings();
  const dir = projectDir(id), work = join(dir, "work");
  await patchJob(id, { status: "running", stage: "Starting", progress: 15 });
  await prepareWork(work, { script: p.scenes, brand: p.brand, aspect: p.aspect }, { minutes: s.videoMinutes, opuscar: hasOpuscar() });
  await runSession(work, {
    model: s.videoModel, minutes: s.videoMinutes, elevenlabsKey: s.elevenlabsKey, signal,
    onStart: (pid) => void patchJob(id, { pid }),
    onUpdate: (u) => void patchJob(id, u),
  });
  await patchJob(id, { stage: "Finishing", progress: 92, pid: null });
  const v = await finish(work, dir, p.aspect);
  await updateProject(id, (q) => {
    q.state = "ready";
    q.video = { ...v, made_at: new Date().toISOString() };
    if (q.job) q.job = { ...q.job, status: "done", stage: "Done", progress: 100 };
  });
}

const alive = (pid: number | null) => { if (!pid) return false; try { process.kill(pid, 0); return true; } catch { return false; } };

/** Once per server start: queued videos go back in line; anything that was running when the app stopped failed. */
export async function recover() {
  if (R.recovered) return;
  R.recovered = true;
  for (const p of await listProjects()) {
    if (!p.job || (p.job.status !== "queued" && p.job.status !== "running")) continue;
    if (p.job.kind === "render" && p.job.status === "queued") { R.queue.push(p.id); continue; }
    if (alive(p.job.pid)) { try { process.kill(process.platform === "win32" ? p.job.pid! : -p.job.pid!, "SIGKILL"); } catch { /* gone */ } }
    await updateProject(p.id, (q) => { q.state = "failed"; if (q.job) q.job = { ...q.job, status: "failed", error: "errors.interrupted", pid: null }; });
  }
  void pump();
}
