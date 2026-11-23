// POST /api/projects/:id/stop: stop making this video (queued or running). The script and any older video stay.
import { fail, ok } from "@/lib/api";
import { stopRender } from "@/lib/jobs";
import { getProject, updateProject } from "@/lib/store";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const p = await getProject((await ctx.params).id);
  if (!p) return fail(404, "errors.notFound");
  if (p.state !== "render_pending") return fail(409, "errors.invalid");
  stopRender(p.id);
  // A queued job never started, so nothing else will update it.
  if (p.job?.status === "queued") await updateProject(p.id, (q) => { q.state = "failed"; if (q.job) q.job = { ...q.job, status: "failed", error: "errors.stopped" }; });
  return ok();
}
