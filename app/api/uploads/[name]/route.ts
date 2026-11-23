// GET /api/uploads/:name: show an uploaded photo or logo in the editor.
import { join } from "node:path";
import { paths } from "@/lib/paths";
import { serveFile } from "@/lib/serve-file";

export async function GET(req: Request, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params;
  if (!/^(logo|photo)-[0-9a-f]{8}\.(jpg|png|webp)$/.test(name)) return new Response("Not found", { status: 404 });
  return serveFile(req, join(paths.uploads, name));
}
