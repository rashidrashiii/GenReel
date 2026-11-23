// POST /api/projects/:id/render: queue the video (from the reviewed script, or "Try again" after a failed video).
import { narrationOf, validateScript } from "@/lib/schema/index.ts";
import { fail, ok } from "@/lib/api";
import { budgetFor } from "@/lib/draft";
import { enqueueRender } from "@/lib/jobs";
import { getSettings, languageAvailable } from "@/lib/settings";
import { getProject } from "@/lib/store";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const p = await getProject((await ctx.params).id);
  if (!p) return fail(404, "errors.notFound");
  if (!(p.state === "draft_ready" || (p.state === "failed" && p.scenes))) return fail(409, "errors.invalid");
  const v = validateScript(p.scenes);
  if (!v.ok) return fail(400, "errors.invalid", v.errors);
  // A script that cannot fit the length would only fail after recording the voice: say so now.
  if (narrationOf(v.script).length > budgetFor(p)) return fail(422, "errors.scriptTooLong");
  if (!languageAvailable(p.language, await getSettings())) return fail(400, "errors.needsVoiceKey");
  await enqueueRender(p.id);
  return ok();
}
