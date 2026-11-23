// POST /api/projects/:id/open: show the project's folder in Finder / Explorer / the file manager.
import { spawn } from "node:child_process";
import { fail, ok } from "@/lib/api";
import { getProject, projectDir } from "@/lib/store";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const p = await getProject((await ctx.params).id);
  if (!p) return fail(404, "errors.notFound");
  const cmd = process.platform === "darwin" ? "open" : process.platform === "win32" ? "explorer" : "xdg-open";
  spawn(cmd, [projectDir(p.id)], { detached: true, stdio: "ignore" }).on("error", () => {}).unref();
  return ok();
}
