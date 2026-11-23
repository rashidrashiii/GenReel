// GET /api/projects/:id/file/video.mp4 | thumb.jpg  (?download=1 saves the video with the title as its name)
import { join } from "node:path";
import { serveFile } from "@/lib/serve-file";
import { getProject, projectDir } from "@/lib/store";

const NAMES = new Set(["video.mp4", "thumb.jpg"]);

export async function GET(req: Request, ctx: { params: Promise<{ id: string; name: string }> }) {
  const { id, name } = await ctx.params;
  const p = NAMES.has(name) ? await getProject(id) : null;
  if (!p) return new Response("Not found", { status: 404 });
  const download = new URL(req.url).searchParams.has("download")
    ? `${(p.title || "video").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "").slice(0, 60) || "video"}.mp4` : undefined;
  return serveFile(req, join(projectDir(id), name), download);
}
