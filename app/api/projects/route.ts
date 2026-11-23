// POST /api/projects: check the form, create the project folder, start writing the script.
import { fail, ok } from "@/lib/api";
import { startDraft } from "@/lib/jobs";
import { getSettings, languageAvailable } from "@/lib/settings";
import { createProject } from "@/lib/store";
import { OWNER } from "@/lib/paths";

const LANGS = ["en", "ml", "hi", "ta"];
const ASPECTS = ["9:16", "1:1", "16:9"] as const;
const LENGTHS = [15, 30, 60, 90];
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return fail(400, "errors.invalid");
  const prompt = str(body.prompt, 1500);
  const language = str(body.language, 2);
  const aspect = (str(body.aspect, 5) || "9:16") as (typeof ASPECTS)[number];
  const target_seconds = Number(body.target_seconds);
  const logo_path = str(body.brand?.logo_path, 300) || null;
  if (prompt.length < 3 || !LANGS.includes(language) || !ASPECTS.includes(aspect) || !LENGTHS.includes(target_seconds)) return fail(400, "errors.invalid");
  if (logo_path && (!logo_path.startsWith(`${OWNER}/`) || logo_path.includes(".."))) return fail(400, "errors.invalid");
  if (!languageAvailable(language, await getSettings())) return fail(400, "errors.needsVoiceKey");
  const p = await createProject({
    prompt, language, aspect, target_seconds,
    brand: { name: str(body.brand?.name, 80) || null, contact: str(body.brand?.contact, 80) || null, logo_path, primary_color: "#1B6B4A" },
  });
  await startDraft(p.id);
  return ok({ id: p.id });
}
