"use client";
import { useId, useState } from "react";
import { useT } from "@/components/i18n";
import { ModelPicker, type Model } from "./model-picker";

type S = { scriptModel: string; videoModel: string; language: string; videoMinutes: number; hasElevenlabsKey: boolean };

const MINUTES = [30, 45, 60, 90, 120];

export function SettingsForm({ initial, models, home }: { initial: S; models: Model[]; home: string }) {
  const { t } = useT();
  const id = useId();
  const [s, setS] = useState(initial);
  const [key, setKey] = useState("");
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(patch: Record<string, unknown>, done = "settings.saved") {
    setBusy(true); setMsg(null);
    const res = await fetch("/api/settings", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(patch) }).catch(() => null);
    const body = await res?.json().catch(() => null);
    setBusy(false);
    if (!res?.ok) { setMsg({ text: body?.error ?? "errors.network", error: true }); return false; }
    setS(body.settings); setMsg({ text: done });
    return true;
  }
  async function test() {
    setBusy(true); setMsg(null);
    const res = await fetch("/api/settings/test-voice", { method: "POST" }).catch(() => null);
    const body = await res?.json().catch(() => null);
    setBusy(false);
    setMsg(res?.ok ? { text: "settings.keyWorks" } : { text: body?.error ?? "errors.network", error: true });
  }

  return (
    <>
      <section className="panel" aria-labelledby={`${id}-claude`}>
        <h2 id={`${id}-claude`} className="panel-h">{t("settings.claude")}</h2>
        <ModelPicker legend={t("settings.videoModel")} help={t("settings.videoModelHelp")} value={s.videoModel} models={models} disabled={busy}
          onChange={(v) => save({ videoModel: v })} />
        <ModelPicker legend={t("settings.scriptModel")} help={t("settings.scriptModelHelp")} value={s.scriptModel} models={models} disabled={busy}
          onChange={(v) => save({ scriptModel: v })} />
        <fieldset aria-describedby={`${id}-min-h`}>
          <legend>{t("settings.minutes")}</legend>
          <p className="help" id={`${id}-min-h`}>{t("settings.minutesHelp")}</p>
          <div className="segmented">
            {MINUTES.map((n) => (
              <label key={n}>
                <input type="radio" name={`${id}-min`} value={n} checked={s.videoMinutes === n} disabled={busy} onChange={() => void save({ videoMinutes: n })} />
                <span>{t("settings.minutesN", { n })}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <section className="panel" aria-labelledby={`${id}-voice`}>
        <h2 id={`${id}-voice`} className="panel-h">{t("settings.voice")}</h2>
        <p>{t("settings.voiceIntro")}</p>
        <div className="field">
          <label htmlFor={`${id}-key`}>{t("settings.key")}</label>
          <input id={`${id}-key`} type="password" autoComplete="off" value={key} onChange={(e) => setKey(e.target.value)}
            placeholder={s.hasElevenlabsKey ? t("settings.keySaved") : "sk_..."} aria-describedby={`${id}-key-h`} />
          <p className="help" id={`${id}-key-h`}>{t("settings.keyHelp")}</p>
        </div>
        <div className="action-bar" style={{ marginTop: 0 }}>
          <button className="btn" disabled={busy || !key.trim()} onClick={async () => { if (await save({ elevenlabsKey: key }, "settings.keySavedMsg")) setKey(""); }}>{t("settings.saveKey")}</button>
          {s.hasElevenlabsKey && <>
            <button className="btn btn-secondary" disabled={busy} onClick={test}>{t("settings.testKey")}</button>
            <button className="link-btn danger" disabled={busy} onClick={() => void save({ elevenlabsKey: "" }, "settings.keyRemoved")}>{t("settings.removeKey")}</button>
          </>}
        </div>
      </section>

      <section className="panel" aria-labelledby={`${id}-files`}>
        <h2 id={`${id}-files`} className="panel-h">{t("settings.files")}</h2>
        <p>{t("settings.filesHelp")}</p>
        <p><code>{home}</code></p>
      </section>

      <p className={msg?.error ? "error-text" : "notice"} role="status" aria-live="polite" hidden={!msg}>{msg ? t(msg.text) : ""}</p>
    </>
  );
}
