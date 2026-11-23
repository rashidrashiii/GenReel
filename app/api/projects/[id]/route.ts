// GET    /api/projects/:id  the project (the page polls this while something is being made)
// PATCH  /api/projects/:id  save the edited script (only while reviewing), checked like a fresh draft
// DELETE /api/projects/:id  delete the project folder (not while its video is being made)
import { rm } from "node:fs/promises";
import { checkScript, validateScript } from "@/lib/schema/index.ts";
import { fail, ok } from "@/lib/api";
import { budgetFor } from "@/lib/draft";
import { queuePosition } from "@/lib/jobs";
import { OWNER } from "@/lib/paths";
import { getProject, projectDir, updateProject } from "@/lib/store";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const p = await getProject((await ctx.params).id);
  return p ? ok({ project: p, position: queuePosition(p.id) }) : fail(404, "errors.notFound");
}

export async function PATCH(req: Request, ctx: Ctx) {
  const p = await getProject((await ctx.params).id);
  if (!p) return fail(404, "errors.notFound");
  if (p.state !== "draft_ready") return fail(409, "errors.invalid");
  const body = await req.json().catch(() => null);
  const v = validateScript(body?.scenes);
  if (!v.ok) return fail(400, "errors.invalid", v.errors);
  const brief = [p.prompt, p.brand.name, p.brand.contact].filter(Boolean).join("\n");
  const problems = checkScript(v.script, { userId: OWNER, maxNarrationChars: budgetFor(p), brief });
  if (problems.length) return fail(400, "errors.invalid", problems);
  v.script.language = p.language as typeof v.script.language;
  await updateProject(p.id, (q) => { q.scenes = v.script; q.title = v.script.title; });
  return ok({ scenes: v.script });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const p = await getProject((await ctx.params).id);
  if (!p) return fail(404, "errors.notFound");
  if (p.state === "render_pending" || p.state === "draft_pending") return fail(409, "errors.busy");
  await rm(projectDir(p.id), { recursive: true, force: true });
  return ok();
}
