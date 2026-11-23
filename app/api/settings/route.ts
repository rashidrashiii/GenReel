// GET  /api/settings: current settings (the ElevenLabs key itself is never sent back)
// POST /api/settings: save; { elevenlabsKey: "" } removes the key
import { fail, ok } from "@/lib/api";
import { getSettings, MODELS, publicSettings, saveSettings, type Settings } from "@/lib/settings";

export async function GET() {
  return ok({ settings: publicSettings(await getSettings()), models: MODELS });
}

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b) return fail(400, "errors.invalid");
  const patch: Partial<Settings> = {};
  const models = MODELS.map((m) => m.id);
  if (typeof b.scriptModel === "string" && models.includes(b.scriptModel)) patch.scriptModel = b.scriptModel;
  if (typeof b.videoModel === "string" && models.includes(b.videoModel)) patch.videoModel = b.videoModel;
  if (["en", "ml", "hi", "ta"].includes(b.language)) patch.language = b.language;
  if (Number.isInteger(b.videoMinutes) && b.videoMinutes >= 15 && b.videoMinutes <= 120) patch.videoMinutes = b.videoMinutes;
  if (typeof b.elevenlabsKey === "string") patch.elevenlabsKey = b.elevenlabsKey.trim().slice(0, 200) || null;
  return ok({ settings: publicSettings(await saveSettings(patch)) });
}
