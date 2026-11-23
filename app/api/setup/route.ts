// GET  /api/setup: what is installed, and the install that is running (if any)
// POST /api/setup { step: "renderer" | "voice" | "opuscar" }: start one install
import { fail, ok } from "@/lib/api";
import { checks, currentTask, ready, startInstall } from "@/lib/setup";

export async function GET() {
  const cs = await checks();
  return ok({ checks: cs, ready: ready(cs), task: currentTask() });
}

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const err = startInstall(String(b?.step ?? ""));
  return err ? fail(409, err) : ok();
}
