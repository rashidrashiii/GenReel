// Stream a local file to the browser, with Range support so videos can be scrubbed.
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";

const TYPES: Record<string, string> = { mp4: "video/mp4", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };

export async function serveFile(req: Request, file: string, downloadName?: string) {
  const st = await stat(file).catch(() => null);
  if (!st?.isFile()) return new Response("Not found", { status: 404 });
  const type = TYPES[file.split(".").pop()!.toLowerCase()] ?? "application/octet-stream";
  const headers: Record<string, string> = { "content-type": type, "accept-ranges": "bytes", "cache-control": "no-store" };
  if (downloadName) headers["content-disposition"] = `attachment; filename*=UTF-8''${encodeURIComponent(downloadName)}`;
  const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.get("range") ?? "");
  if (m && (m[1] || m[2])) {
    const start = m[1] ? Number(m[1]) : Math.max(0, st.size - Number(m[2]));
    const end = m[1] && m[2] ? Math.min(Number(m[2]), st.size - 1) : st.size - 1;
    if (start > end || start >= st.size) return new Response(null, { status: 416, headers: { "content-range": `bytes */${st.size}` } });
    const body = Readable.toWeb(createReadStream(file, { start, end })) as ReadableStream;
    return new Response(body, { status: 206, headers: { ...headers, "content-range": `bytes ${start}-${end}/${st.size}`, "content-length": String(end - start + 1) } });
  }
  return new Response(Readable.toWeb(createReadStream(file)) as ReadableStream, { headers: { ...headers, "content-length": String(st.size) } });
}
