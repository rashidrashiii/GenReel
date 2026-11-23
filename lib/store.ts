// Projects are folders under ~/genreel/projects/<id>/ with a project.json. No database: one person, one machine.
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { VideoScript } from "./schema/index.ts";
import { paths } from "./paths.ts";

export type State = "draft_pending" | "draft_ready" | "render_pending" | "ready" | "failed";
export type Job = {
  kind: "draft" | "render";
  status: "queued" | "running" | "done" | "failed";
  stage: string | null;
  progress: number;
  error: string | null; // user-safe message
  created_at: string;
  updated_at: string; // the "last update" the progress screen shows
  pid: number | null;
};
export type Project = {
  id: string;
  created_at: string;
  updated_at: string;
  prompt: string;
  language: string;
  aspect: "9:16" | "1:1" | "16:9";
  target_seconds: number;
  brand: { name: string | null; contact: string | null; logo_path: string | null; primary_color: string };
  title: string | null;
  scenes: VideoScript | null;
  state: State;
  job: Job | null;
  video: { file: string; thumb: string | null; duration: number; made_at: string } | null; // last finished video
};

const ID = /^[0-9a-f-]{36}$/;
export const projectDir = (id: string) => {
  if (!ID.test(id)) throw new Error("bad project id");
  return join(paths.projects, id);
};

export async function getProject(id: string): Promise<Project | null> {
  if (!ID.test(id)) return null;
  try { return JSON.parse(await readFile(join(projectDir(id), "project.json"), "utf8")); } catch { return null; }
}

/** Write to a temp file and rename: a crash never leaves half a project.json. */
async function save(p: Project) {
  const dir = projectDir(p.id);
  await mkdir(dir, { recursive: true });
  const tmp = join(dir, `.project.${process.pid}.${Date.now()}.tmp`);
  await writeFile(tmp, JSON.stringify(p, null, 2));
  await rename(tmp, join(dir, "project.json"));
  return p;
}

export async function createProject(input: Pick<Project, "prompt" | "language" | "aspect" | "target_seconds" | "brand">) {
  const now = new Date().toISOString();
  return save({ id: randomUUID(), created_at: now, updated_at: now, title: null, scenes: null, state: "draft_pending", job: null, video: null, ...input });
}

// ponytail: one process writes project.json (the local server), so a per-id promise chain is enough to keep
// read-modify-write updates in order; a file lock would be needed only with several servers on one folder.
const chains = new Map<string, Promise<unknown>>();
export function updateProject(id: string, fn: (p: Project) => Project | void): Promise<Project | null> {
  const run = (chains.get(id) ?? Promise.resolve()).then(async () => {
    const p = await getProject(id);
    if (!p) return null;
    const next = fn(p) ?? p;
    next.updated_at = new Date().toISOString();
    return save(next);
  });
  chains.set(id, run.catch(() => {}));
  return run;
}

/** Merge into the current job; undefined fields are ignored (a check-in without a new stage keeps the old one). */
export const patchJob = (id: string, patch: Partial<Job>) =>
  updateProject(id, (p) => {
    const defined = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined));
    if (p.job) p.job = { ...p.job, ...defined, updated_at: new Date().toISOString() };
  });

export async function listProjects(): Promise<Project[]> {
  if (!existsSync(paths.projects)) return [];
  const ids = (await readdir(paths.projects)).filter((d) => ID.test(d));
  const all = await Promise.all(ids.map(getProject));
  return all.filter((p): p is Project => p !== null).sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export const newJob = (kind: Job["kind"]): Job => {
  const now = new Date().toISOString();
  return { kind, status: "queued", stage: null, progress: 0, error: null, created_at: now, updated_at: now, pid: null };
};
