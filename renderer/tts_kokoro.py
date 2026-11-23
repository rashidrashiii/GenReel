"""Free local voice for genreel (Kokoro, runs on this computer).

Reads JSON on stdin: {"texts": [...one per shot...], "voice": "af_heart", "lang": "en-us",
                      "model": ".../kokoro-v1.0.onnx", "voices": ".../voices-v1.0.bin", "out": ".../voice.wav"}
Speaks each shot separately (so shot timing is exact), joins them with a short pause into one WAV,
and prints JSON: {"shots": [{"start": s, "end": s}, ...], "duration": s}.
"""
import json
import sys
import wave

import numpy as np
from kokoro_onnx import Kokoro

GAP = 0.15  # seconds of silence between shots


def main():
    job = json.load(sys.stdin)
    kokoro = Kokoro(job["model"], job["voices"])
    parts, shots, t, rate = [], [], 0.0, 24000
    for text in job["texts"]:
        samples, rate = kokoro.create(text, voice=job["voice"], speed=1.0, lang=job["lang"])
        samples = np.asarray(samples, dtype=np.float32)
        dur = len(samples) / rate
        shots.append({"start": round(t, 3), "end": round(t + dur, 3)})
        parts.extend([samples, np.zeros(int(GAP * rate), dtype=np.float32)])
        t += dur + GAP
    audio = np.concatenate(parts) if parts else np.zeros(rate, dtype=np.float32)
    pcm = (np.clip(audio, -1.0, 1.0) * 32767).astype("<i2")
    with wave.open(job["out"], "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(rate)
        w.writeframes(pcm.tobytes())
    json.dump({"shots": shots, "duration": round(len(audio) / rate, 3)}, sys.stdout)


if __name__ == "__main__":
    main()
