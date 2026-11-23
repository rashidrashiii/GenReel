"use client";
import { useId, useState } from "react";
import { useT } from "@/components/i18n";

type S = { scriptModel: string; videoModel: string; language: string; videoMinutes: number; hasElevenlabsKey: boolean };

export function SettingsForm({ initial, models, home }: { initial: S; models: { id: string; label: string }[]; home: string }) {
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

  const select = (field: "scriptModel" | "videoModel", label: string, help: string) => (
    <div className="field">
      <label htmlFor={`${id}-${field}`}>{label}</label>
      <select id={`${id}-${field}`} value={s[field]} disabled={busy} onChange={(e) => void save({ [field]: e.target.value })} aria-describedby={`${id}-${field}-h`}>
        {models.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
      </select>
      <p className="help" id={`${id}-${field}-h`}>{help}</p>
    </div>
  );

  return (
    <>
      <section className="panel" aria-labelledby={`${id}-claude`}>
        <h2 id={`${id}-claude`} className="panel-h">{t("settings.claude")}</h2>
        {select("videoModel", t("settings.videoModel"), t("settings.videoModelHelp"))}
        {select("scriptModel", t("settings.scriptModel"), t("settings.scriptModelHelp"))}
        <div className="field">
          <label htmlFor={`${id}-min`}>{t("settings.minutes")}</label>
          <input id={`${id}-min`} type="number" min={15} max={120} step={5} value={s.videoMinutes} disabled={busy}
            onChange={(e) => setS({ ...s, videoMinutes: Number(e.target.value) })}
            onBlur={() => void save({ videoMinutes: Math.min(120, Math.max(15, Math.round(s.videoMinutes))) })} aria-describedby={`${id}-min-h`} />
          <p className="help" id={`${id}-min-h`}>{t("settings.minutesHelp")}</p>
        </div>
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
