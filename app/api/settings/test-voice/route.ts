// POST /api/settings/test-voice: check the saved ElevenLabs key works (asks ElevenLabs for the account's voices).
import { fail, ok } from "@/lib/api";
import { getSettings } from "@/lib/settings";

export async function POST() {
  const key = (await getSettings()).elevenlabsKey;
  if (!key) return fail(400, "settings.noKey");
  const r = await fetch("https://api.elevenlabs.io/v1/voices", { headers: { "xi-api-key": key }, signal: AbortSignal.timeout(15_000) }).catch(() => null);
  return r?.ok ? ok() : fail(400, r?.status === 401 ? "settings.keyWrong" : "errors.network");
}
