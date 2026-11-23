// Mouth data (docs/VISUAL_UPGRADE.md §6.3): RMS of the voice per video frame, 3-frame average, normalised by the
// 95th percentile, clamped 0..1. Decoded with FFmpeg to 16 kHz mono PCM; no browser audio analysis.
// CLI: node mouth.mjs <audio> [fps] [frames]  -> JSON array on stdout
import { execFileSync } from "node:child_process";

export function mouthFromAudio(file, fps = 30, frames = 0) {
  const pcm = execFileSync("ffmpeg", ["-nostdin", "-v", "error", "-i", file, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], { maxBuffer: 1 << 28 });
  const samples = new Int16Array(pcm.buffer, pcm.byteOffset, Math.floor(pcm.length / 2));
  const per = 16000 / fps;
  const n = frames || Math.ceil(samples.length / per);
  const rms = new Array(n).fill(0);
  for (let f = 0; f < n; f++) {
    const a = Math.floor(f * per), b = Math.min(samples.length, Math.floor((f + 1) * per));
    let sum = 0;
    for (let i = a; i < b; i++) sum += (samples[i] / 32768) ** 2;
    rms[f] = b > a ? Math.sqrt(sum / (b - a)) : 0;
  }
  const smooth = rms.map((_, f) => (rms[Math.max(0, f - 1)] + rms[f] + rms[Math.min(n - 1, f + 1)]) / 3);
  const sorted = [...smooth].sort((x, y) => x - y);
  const p95 = sorted[Math.floor(sorted.length * 0.95)] || 1;
  return smooth.map((v) => Math.round(Math.min(1, Math.max(0, v / p95)) * 1000) / 1000);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [file, fps = "30", frames = "0"] = process.argv.slice(2);
  process.stdout.write(JSON.stringify(mouthFromAudio(file, Number(fps), Number(frames))));
}
