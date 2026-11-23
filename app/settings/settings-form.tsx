"use client";
import { useId, useState } from "react";
import { useT } from "@/components/i18n";
import { ModelPicker, type Model } from "./model-picker";
import { Logo } from "@/components/logo";
import { ABOUT } from "@/lib/about";

type S = { scriptModel: string; videoModel: string; language: string; videoMinutes: number; hasElevenlabsKey: boolean };

const MINUTES = [30, 45, 60, 90, 120];

/** One collapsible row per setting; closed, it still shows what is chosen. */
function Section({ title, value, children }: { title: string; value: string; children: React.ReactNode }) {
  return (
    <details className="panel setting">
      <summary><span className="setting-title">{title}</span><span className="setting-value">{value}</span></summary>
      <div className="setting-body">{children}</div>
    </details>
  );
}

export function SettingsForm({ initial, models, home, version }: { initial: S; models: Model[]; home: string; version: string }) {
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

  const nameOf = (mid: string) => models.find((m) => m.id === mid)?.name ?? mid;

  return (
    <>
      <h2 className="settings-group">{t("settings.claude")}</h2>
      <Section title={t("settings.videoModel")} value={nameOf(s.videoModel)}>
        <ModelPicker legend={t("settings.videoModel")} help={t("settings.videoModelHelp")} value={s.videoModel} models={models} disabled={busy}
          onChange={(v) => save({ videoModel: v })} />
      </Section>
      <Section title={t("settings.scriptModel")} value={nameOf(s.scriptModel)}>
        <ModelPicker legend={t("settings.scriptModel")} help={t("settings.scriptModelHelp")} value={s.scriptModel} models={models} disabled={busy}
          onChange={(v) => save({ scriptModel: v })} />
      </Section>
      <Section title={t("settings.minutes")} value={t("settings.minutesN", { n: s.videoMinutes })}>
        <fieldset aria-describedby={`${id}-min-h`}>
          <legend className="visually-hidden">{t("settings.minutes")}</legend>
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
      </Section>

      <h2 className="settings-group">{t("settings.voice")}</h2>
      <Section title={t("settings.key")} value={s.hasElevenlabsKey ? t("settings.keyOn") : t("settings.keyOff")}>
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
      </Section>

      <h2 className="settings-group">{t("settings.files")}</h2>
      <Section title={t("settings.filesWhere")} value={home}>
        <p>{t("settings.filesHelp")}</p>
        <p><code>{home}</code></p>
      </Section>

      <h2 className="settings-group">{t("settings.about")}</h2>
      <Section title={t("settings.aboutTitle")} value={t("settings.version", { v: version })}>
        <div className="about-row">
          <Logo size={56} />
          <p style={{ margin: 0 }}>
            {t("settings.aboutBody")} <a href={ABOUT.authorUrl} target="_blank" rel="noreferrer">@{ABOUT.author}</a>.
          </p>
        </div>
        <ul className="about-links">
          <li><a href={ABOUT.repo} target="_blank" rel="noreferrer">{t("settings.star")}</a></li>
          <li><a href={ABOUT.issues} target="_blank" rel="noreferrer">{t("settings.report")}</a></li>
        </ul>
      </Section>

      <p className={msg?.error ? "error-text" : "notice"} role="status" aria-live="polite" hidden={!msg}>{msg ? t(msg.text) : ""}</p>
    </>
  );
}
