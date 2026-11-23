// POST /api/uploads (multipart "file"): save a photo or logo into ~/genreel/uploads; scripts refer to it as "local/<name>".
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fail, ok } from "@/lib/api";
import { OWNER, paths } from "@/lib/paths";

const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX = 5 * 1024 * 1024;

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const f = form?.get("file");
  if (!(f instanceof File) || !EXT[f.type]) return fail(400, "create.logoType");
  if (f.size > MAX) return fail(400, "create.logoTooBig");
  const kind = form?.get("kind") === "logo" ? "logo" : "photo";
  const name = `${kind}-${randomUUID().slice(0, 8)}.${EXT[f.type]}`;
  await mkdir(paths.uploads, { recursive: true });
  await writeFile(join(paths.uploads, name), Buffer.from(await f.arrayBuffer()));
  return ok({ path: `${OWNER}/${name}` });
}
