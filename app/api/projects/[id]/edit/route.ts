// POST /api/projects/:id/edit: back to the script for any finished or failed video. The last video stays until a new one is done.
import { fail, ok } from "@/lib/api";
import { getProject, updateProject } from "@/lib/store";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const p = await getProject((await ctx.params).id);
  if (!p) return fail(404, "errors.notFound");
  if (!p.scenes || !["ready", "failed"].includes(p.state)) return fail(409, "errors.invalid");
  await updateProject(p.id, (q) => { q.state = "draft_ready"; });
  return ok();
}
