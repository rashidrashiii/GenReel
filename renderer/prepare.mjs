// Prepares a render: ONE voice track for the whole narration (ElevenLabs with character timings when the user has a
// key, otherwise the free local Kokoro voice, spoken shot by shot), beat frames from word timings, per-frame mouth data,
// caption pages, photos, sfx, music -> props.json.
// Usage (in a genreel session): WORK_DIR=<project>/work node <renderer>/prepare.mjs -> build/props.json + build/public/
// Exit code 2 + message on stderr = cannot make this video (write a short line to out/error.txt).
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { mouthFromAudio } from "./mouth.mjs";

const FPS = 30, ANTICIPATION = 3, MIN_BEAT = 36, TAIL = 20, END_CARD = 60;
const WORK = process.env.WORK_DIR || process.cwd();
const HERE = dirname(fileURLToPath(import.meta.url));
const brief = JSON.parse(readFileSync(`${WORK}/input/brief.json`, "utf8"));
const { script, brand = {}, width, height, max_seconds } = brief;
const lang = script.language;
const pub = `${WORK}/build/public`;
for (const d of ["vo", "img", "sfx"]) mkdirSync(`${pub}/${d}`, { recursive: true });

const fail = (msg) => { console.error(msg); process.exit(2); };
const stage = (s) => { mkdirSync(`${WORK}/out`, { recursive: true }); writeFileSync(`${WORK}/out/stage.txt`, s); };

// Stock ElevenLabs voices only (no cloning). eleven_v3 is the model that accepts Malayalam (Phase 1 spike).
const VOICES = { warm_female: "EXAVITQu4vr4xnSDxMaL", calm_male: "JBFqnCBsd6RMkjVDRZzb", energetic_female: "cgSgspJ2msm6clMCkdW9", energetic_male: "TX3LPaxmHKxFdv7VOQHJ" };
const voiceId = VOICES[script.voice] ?? VOICES.warm_female;

async function retry(fn, tries = 3) {
  for (let i = 0; ; i++) {
    try { return await fn(); } catch (e) { if (i >= tries - 1 || /quota|401/.test(String(e))) throw e; await new Promise((r) => setTimeout(r, 2000 * 2 ** i)); }
  }
}

async function tts(text) {
  return retry(async () => {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`, {
      method: "POST", headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY ?? "", "content-type": "application/json" },
      body: JSON.stringify({ text, model_id: "eleven_v3", language_code: lang }), signal: AbortSignal.timeout(120_000),
    });
    if (!r.ok) throw new Error(`voice ${r.status}: ${(await r.text()).slice(0, 200)}`);
    return r.json();
  });
}

// Free local voice (Kokoro). Each shot is spoken separately, so shot boundaries are exact; inside a shot, character
// times are spread evenly (good enough for word-by-word captions). Writes voice.mp3, returns an ElevenLabs-like alignment.
const KOKORO_VOICES = {
  en: { warm_female: "af_heart", calm_male: "am_michael", energetic_female: "af_bella", energetic_male: "am_puck" },
  hi: { warm_female: "hf_alpha", calm_male: "hm_omega", energetic_female: "hf_beta", energetic_male: "hm_psi" },
};
const KOKORO_LANG = { en: "en-us", hi: "hi" };
function localVoice(texts) {
  if (!KOKORO_LANG[lang]) fail(`no free local voice for "${lang}"; add an ElevenLabs key in genreel Settings`);
  const py = process.env.GENREEL_PYTHON, voices = process.env.GENREEL_VOICES;
  if (!py || !voices) fail("the free voice is not installed; open genreel's Setup page");
  const python = process.platform === "win32" ? join(py, "Scripts", "python.exe") : join(py, "bin", "python");
  const wav = `${pub}/vo/voice.wav`;
  let res;
  try {
    res = JSON.parse(execFileSync(python, [join(HERE, "tts_kokoro.py")], {
      input: JSON.stringify({ texts, voice: (KOKORO_VOICES[lang] ?? KOKORO_VOICES.en)[script.voice] ?? KOKORO_VOICES[lang].warm_female, lang: KOKORO_LANG[lang],
        model: join(voices, "kokoro-v1.0.onnx"), voices: join(voices, "voices-v1.0.bin"), out: wav }),
      encoding: "utf8", maxBuffer: 1 << 20, stdio: ["pipe", "pipe", "inherit"],
    }));
  } catch (e) { fail(`voice failed: ${e.message}`); }
  execFileSync("ffmpeg", ["-nostdin", "-v", "error", "-y", "-i", wav, "-c:a", "libmp3lame", "-b:a", "128k", `${pub}/vo/voice.mp3`]);
  const characters = [], character_start_times_seconds = [], character_end_times_seconds = [];
  texts.forEach((text, i) => {
    const { start, end } = res.shots[i], step = (end - start) / Math.max(1, text.length);
    if (i > 0) { characters.push(" "); character_start_times_seconds.push(start); character_end_times_seconds.push(start); }
    [...text].forEach((c, k) => { characters.push(c); character_start_times_seconds.push(start + k * step); character_end_times_seconds.push(start + (k + 1) * step); });
  });
  return { alignment: { characters, character_start_times_seconds, character_end_times_seconds } };
}

const probe = (f) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], { encoding: "utf8" }));
const fr = (t) => Math.round(t * FPS);

// ------------------------------------------------------------------ voice + word timings
stage("Recording the voice");
const narrations = script.beats.map((b) => b.narration.trim().replace(/\s+/g, " "));
const beatWordCounts = narrations.map((n) => n.split(" ").filter(Boolean).length);
const narration = narrations.join(" ");
const voiceFile = process.env.VOICE_FILE; // tests/samples may pass a recorded file + alignment instead of calling TTS
const useEleven = Boolean(process.env.ELEVENLABS_API_KEY);
const t = voiceFile ? JSON.parse(readFileSync(process.env.ALIGNMENT_FILE, "utf8"))
  : useEleven ? await tts(narration).catch((e) => fail(`voice failed: ${e.message}`))
  : localVoice(narrations);
if (voiceFile) copyFileSync(voiceFile, `${pub}/vo/voice.mp3`); else if (t.audio_base64) writeFileSync(`${pub}/vo/voice.mp3`, Buffer.from(t.audio_base64, "base64"));
let audioLen = probe(`${pub}/vo/voice.mp3`);

let words = [];
{
  const al = t.alignment;
  let cur = "", s = 0, e = 0;
  al?.characters?.forEach((c, k) => {
    if (/\s/.test(c)) { if (cur) words.push({ w: cur, s, e }); cur = ""; return; }
    if (!cur) s = al.character_start_times_seconds[k];
    cur += c; e = al.character_end_times_seconds[k];
  });
  if (cur) words.push({ w: cur, s, e });
}
const want = beatWordCounts.reduce((a, b) => a + b, 0);
if (words.length !== want) {
  // Timings missing or the words do not line up: estimate by character proportion (doc §6.1).
  console.error(`word timing mismatch (${words.length} vs ${want}); estimating by characters`);
  const all = narration.split(" ");
  const total = all.reduce((n, w) => n + w.length + 1, 0);
  let acc = 0;
  words = all.map((w) => { const s = (acc / total) * audioLen; acc += w.length + 1; return { w, s, e: (acc / total) * audioLen - 0.04 }; });
}

// ------------------------------------------------------------------ beat frames
// Words per beat with frame times; beat i starts 3 frames before its first word, never sooner than MIN_BEAT after the
// previous beat started; then a tail and the brand end card.
function layout(tail, card) {
  const beatWords = [];
  let k = 0;
  for (const n of beatWordCounts) { beatWords.push(words.slice(k, k + n).map((w) => ({ w: w.w, f0: fr(w.s), f1: Math.max(fr(w.s) + 1, fr(w.e)) }))); k += n; }
  const starts = [];
  beatWords.forEach((ws, i) => {
    const first = ws[0]?.f0 ?? (starts[i - 1] ?? 0) + MIN_BEAT;
    starts.push(i === 0 ? 0 : Math.max(first - ANTICIPATION, starts[i - 1] + MIN_BEAT));
  });
  const lastWord = Math.max(...words.map((w) => fr(w.e)));
  const contentEnd = Math.max(lastWord, fr(audioLen)) + tail;
  const total = Math.max(contentEnd, starts.at(-1) + MIN_BEAT) + card;
  return { beatWords, starts, contentEnd, total };
}
// Fitting the cap without failing after the voice was paid for: 1) shorter tail and end card; 2) if still over by at most
// 12 %, speed the voice up (ffmpeg atempo keeps the pitch) and rescale every word time; 3) else give up for good.
const maxFrames = Math.floor(max_seconds * FPS);
let L = layout(TAIL, END_CARD);
if (L.total > maxFrames) L = layout(8, 36);
if (L.total > maxFrames) {
  const speech = L.total - 8 - 36, room = maxFrames - 8 - 36 - 2;
  const speed = speech / room;
  if (speed > 1.12) {
    writeFileSync(`${WORK}/out/no_retry`, "too long");
    fail(`too long: ${(L.total / FPS).toFixed(1)}s > ${max_seconds}s even with a short end card (needs ${speed.toFixed(2)}x)`);
  }
  execFileSync("ffmpeg", ["-nostdin", "-v", "error", "-y", "-i", `${pub}/vo/voice.mp3`, "-filter:a", `atempo=${speed.toFixed(4)}`, "-b:a", "128k", `${pub}/vo/voice-fast.mp3`]);
  execFileSync("mv", [`${pub}/vo/voice-fast.mp3`, `${pub}/vo/voice.mp3`]);
  words = words.map((w) => ({ ...w, s: w.s / speed, e: w.e / speed }));
  audioLen = probe(`${pub}/vo/voice.mp3`);
  L = layout(8, 36);
  console.error(`voice sped up ${speed.toFixed(3)}x to fit ${max_seconds}s`);
}
const { beatWords, starts, contentEnd, total } = L;

// ------------------------------------------------------------------ caption pages (2-4 words; ml/ta 2-3)
const maxPage = lang === "ml" || lang === "ta" ? 3 : 4;
function pagesOf(ws, beatEnd) {
  // Phrases break at sentence ends and pauses > 0.25 s; each phrase splits into balanced pages, never a lone word.
  const phrases = [];
  for (const w of ws) {
    const p = phrases.at(-1), last = p?.at(-1);
    if (!p || w.f0 - last.f1 > 0.25 * FPS || /[.!?।,]$/.test(last.w) && p.length >= 2) phrases.push([w]); else p.push(w);
  }
  // Merge a one-word phrase into its neighbour.
  for (let i = 0; i < phrases.length; i++) if (phrases[i].length === 1 && phrases.length > 1) {
    const j = i > 0 ? i - 1 : i + 1; phrases[j] = i > 0 ? [...phrases[j], ...phrases[i]] : [...phrases[i], ...phrases[j]]; phrases.splice(i, 1); i--;
  }
  const pages = [];
  for (const p of phrases) {
    let k = Math.ceil(p.length / maxPage);
    if (k > 1 && Math.floor(p.length / k) < 2) k = Math.max(1, Math.floor(p.length / 2));
    const base = Math.floor(p.length / k), extra = p.length % k;
    for (let i = 0, at = 0; i < k; i++) { const n = base + (i < extra ? 1 : 0); pages.push(p.slice(at, at + n)); at += n; }
  }
  // Character cap: a long page would wrap to two small lines; split it (never leaving a lone word if avoidable).
  const cap = lang === "ml" || lang === "ta" ? 22 : 26;
  const text = (pw) => pw.map((w) => w.w).join(" ");
  for (let i = 0; i < pages.length; i++) {
    const pw = pages[i];
    if (text(pw).length <= cap || pw.length < 2) continue;
    let cut = 1, best = Infinity; // the most balanced split by characters
    for (let c = 1; c < pw.length; c++) { const m = Math.max(text(pw.slice(0, c)).length, text(pw.slice(c)).length); if (m < best) { best = m; cut = c; } }
    pages.splice(i, 1, pw.slice(0, cut), pw.slice(cut)); i--;
  }
  // A very short lone page (<= 5 letters) joins its neighbour when the result stays close to the cap.
  for (let i = 0; i < pages.length; i++) {
    if (pages.length < 2 || text(pages[i]).length > 5) continue;
    const j = i > 0 ? i - 1 : i + 1;
    if (text([...pages[Math.min(i, j)], ...pages[Math.max(i, j)]]).length <= cap + 8) { pages.splice(Math.min(i, j), 2, [...pages[Math.min(i, j)], ...pages[Math.max(i, j)]]); i--; }
  }
  return pages.map((pw, i) => ({ from: pw[0].f0 - 1, to: pages[i + 1] ? pages[i + 1][0].f0 - 1 : beatEnd, words: pw }));
}

// ------------------------------------------------------------------ photos, logo, music, sfx
stage("Preparing the scenes");
function upload(path, name) {
  if (!path) return null;
  const rel = normalize(path);
  const src = join(`${WORK}/input/uploads`, rel);
  if (rel.startsWith("..") || !existsSync(src)) return null;
  const dst = `img/${name}${extname(src) || ".jpg"}`;
  copyFileSync(src, `${pub}/${dst}`);
  return dst;
}

const beats = script.beats.map((b, i) => {
  const from = starts[i], to = i + 1 < starts.length ? starts[i + 1] : Math.max(contentEnd, from + MIN_BEAT);
  const ws = beatWords[i];
  const { photo, narration: _n, ...rest } = b;
  return {
    ...rest, from, to, words: ws, pages: pagesOf(ws, to),
    emph: (b.emphasis ?? []).map((k) => ws[k]?.f0).filter((f) => f !== undefined),
    photo: upload(photo?.upload_path, `beat${i}`),
  };
});

const logo = upload(brand.logo_path, "logo");
let music = null;
const musicDir = brief.music_dir || join(process.env.GENREEL_ASSETS || join(HERE, "../assets"), "music");
if (script.music !== "none" && existsSync(`${musicDir}/manifest.json`)) {
  const track = JSON.parse(readFileSync(`${musicDir}/manifest.json`, "utf8")).find((m) => m.mood === script.music);
  if (track && existsSync(`${musicDir}/${track.file}`)) { music = `music${extname(track.file)}`; copyFileSync(`${musicDir}/${track.file}`, `${pub}/${music}`); }
}
const sfxDir = join(process.env.GENREEL_ASSETS || join(HERE, "../assets"), "sfx");
const sfx = {};
for (const n of ["whoosh", "pop", "tick", "ding", "thud", "swipe"]) if (existsSync(`${sfxDir}/${n}.wav`)) { copyFileSync(`${sfxDir}/${n}.wav`, `${pub}/sfx/${n}.wav`); sfx[n] = `sfx/${n}.wav`; }

// Speech intervals (frames) for music ducking; gaps < 0.3 s merge.
const speech = [];
for (const w of words) {
  const [a, b] = [fr(w.s), fr(w.e)], last = speech.at(-1);
  if (last && a - last[1] < 0.3 * FPS) last[1] = b; else speech.push([a, b]);
}

const props = {
  width, height, fps: FPS, language: lang, title: script.title, background: script.background ?? "studio",
  primary: brand.primary_color || "#1B6B4A", brand: { name: brand.name ?? null, contact: brand.contact ?? null, logo },
  music, voice: "vo/voice.mp3", total, contentEnd, beats, mouth: mouthFromAudio(`${pub}/vo/voice.mp3`, FPS, total), speech, sfx,
};
writeFileSync(`${WORK}/build/props.json`, JSON.stringify(props));
writeFileSync(`${WORK}/out/usage.json`, JSON.stringify({ voice: voiceFile ? "file" : useEleven ? "elevenlabs" : "kokoro", characters: narration.length }));
const lens = beats.map((b) => b.to - b.from);
console.log(`ok: ${beats.length} beats, ${(total / FPS).toFixed(1)}s (${total} frames), beat ${Math.min(...lens)}-${Math.max(...lens)} frames, ${beats.reduce((n, b) => n + b.pages.length, 0)} caption pages, photos: ${beats.filter((b) => b.photo).length}, logo: ${!!logo}, music: ${!!music}`);
