// POST /api/projects/:id/retry: a failed script draft starts again (failed videos use /render).
import { fail, ok } from "@/lib/api";
import { startDraft } from "@/lib/jobs";
import { getProject } from "@/lib/store";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const p = await getProject((await ctx.params).id);
  if (!p) return fail(404, "errors.notFound");
  if (p.state !== "failed" || p.scenes) return fail(409, "errors.invalid");
  await startDraft(p.id);
  return ok();
}
