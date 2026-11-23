"use client";
import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LOGO_TYPES, MAX_UPLOAD, uploadImage } from "@/lib/upload";
import { useT } from "@/components/i18n";

const SHAPES = [
  { v: "9:16", w: 14, h: 24 },
  { v: "1:1", w: 20, h: 20 },
  { v: "16:9", w: 26, h: 15 },
];

const LANG_NAMES: Record<string, string> = { en: "English", hi: "हिन्दी", ml: "മലയാളം", ta: "தமிழ்" };
const LENGTHS = [15, 30, 60, 90];

export function CreateForm({ initialPrompt = "", initialLang = "en", languages }: { initialPrompt?: string; initialLang?: string; languages: { code: string; available: boolean }[] }) {
  const { t } = useT();
  const router = useRouter();
  const id = useId();
  const [prompt, setPrompt] = useState(initialPrompt);
  const [language, setLanguage] = useState(initialLang);
  const [seconds, setSeconds] = useState(30);
  const [aspect, setAspect] = useState("9:16");
  const [shopName, setShopName] = useState("");
  const [contact, setContact] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ prompt?: string; logo?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);

  function pickLogo(f: File | null) {
    setErrors((e) => ({ ...e, logo: undefined }));
    if (logoUrl) URL.revokeObjectURL(logoUrl);
    if (f && (!LOGO_TYPES.includes(f.type) || f.size > MAX_UPLOAD)) {
      setLogo(null); setLogoUrl(null);
      setErrors((e) => ({ ...e, logo: "create.logoTooBig" }));
      return;
    }
    setLogo(f);
    setLogoUrl(f ? URL.createObjectURL(f) : null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (prompt.trim().length < 3) {
      setErrors({ prompt: "create.promptTooShort" });
      document.getElementById(`${id}-prompt`)?.focus();
      return;
    }
    setBusy(true); setErrors({});
    try {
      const logo_path = logo ? await uploadImage(logo, "logo") : null;
      const res = await fetch("/api/projects", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt, language, target_seconds: seconds, aspect, brand: { name: shopName, contact, logo_path } }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "failed.generic");
      router.push(`/p/${body.id}`);
    } catch (err) {
      const key = err instanceof Error && err.message.includes(".") ? err.message : "errors.network";
      setErrors({ form: key });
      setBusy(false);
    }
  }

  const err = (k?: string, fid?: string) => k ? <p className="error-text" id={fid}>{t(k)}</p> : null;

  return (
    <form onSubmit={submit} noValidate>
      <section className="panel" aria-labelledby={`${id}-prompt-l`}>
        <label id={`${id}-prompt-l`} htmlFor={`${id}-prompt`} className="panel-h">{t("create.prompt")}</label>
        <textarea id={`${id}-prompt`} className="big" rows={5} value={prompt} maxLength={1500} placeholder={t("create.promptHelp")}
          onChange={(e) => setPrompt(e.target.value)} aria-invalid={!!errors.prompt}
          aria-describedby={`${id}-prompt-help${errors.prompt ? ` ${id}-prompt-err` : ""}`} />
        <p className="help" id={`${id}-prompt-help`}>{t("create.promptTip")}</p>
        {err(errors.prompt, `${id}-prompt-err`)}
        <p className="label" id={`${id}-ex`} style={{ marginTop: 16, marginBottom: 0 }}>{t("create.examples")}</p>
        <div className="chips" role="list" aria-labelledby={`${id}-ex`}>
          {[1, 2, 3, 4].map((n) => (
            <button key={n} type="button" role="listitem" className="chip" onClick={() => { setPrompt(t(`create.example${n}`)); document.getElementById(`${id}-prompt`)?.focus(); }}>
              <b>{t(`create.exampleTag${n}`)}</b>{t(`create.example${n}`)}
            </button>
          ))}
        </div>
      </section>

      <section className="panel" aria-labelledby={`${id}-opts`}>
        <h2 id={`${id}-opts`} className="panel-h">{t("create.options")}</h2>
        <fieldset>
          <legend>{t("create.language")}</legend>
          <div className="segmented">
            {languages.map(({ code, available }) => (
              <label key={code} lang={code}>
                <input type="radio" name="language" value={code} checked={language === code} disabled={!available} onChange={() => setLanguage(code)} />
                <span>{LANG_NAMES[code]}</span>
              </label>
            ))}
          </div>
          {languages.some((l) => !l.available) && <p className="help">{t("create.voiceKeyNote")} <Link href="/settings">{t("nav.settings")}</Link></p>}
        </fieldset>
        <fieldset>
          <legend>{t("create.length")}</legend>
          <div className="segmented">
            {LENGTHS.map((n) => (
              <label key={n}><input type="radio" name="seconds" value={n} checked={seconds === n} onChange={() => setSeconds(n)} /><span>{t("create.seconds", { n })}</span></label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>{t("create.shape")}</legend>
          <div className="segmented">
            {SHAPES.map((s) => (
              <label key={s.v}>
                <input type="radio" name="aspect" value={s.v} checked={aspect === s.v} onChange={() => setAspect(s.v)} />
                <span><i className="shape-icon" aria-hidden="true" style={{ width: s.w, height: s.h }} />{t(`create.shape.${s.v}`)}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <section className="panel" aria-labelledby={`${id}-mine`}>
        <h2 id={`${id}-mine`} className="panel-h">{t("create.personal")} <small>{t("create.optional")}</small></h2>
        <div className="field">
          <label htmlFor={`${id}-shop`}>{t("create.shopName")}</label>
          <input id={`${id}-shop`} type="text" value={shopName} maxLength={80} onChange={(e) => setShopName(e.target.value)} autoComplete="organization" />
        </div>
        <div className="field">
          <label htmlFor={`${id}-contact`}>{t("create.contact")}</label>
          <input id={`${id}-contact`} type="text" value={contact} maxLength={80} onChange={(e) => setContact(e.target.value)} aria-describedby={`${id}-contact-help`} />
          <p className="help" id={`${id}-contact-help`}>{t("create.contactHelp")}</p>
        </div>
        <div className="field">
          <label htmlFor={`${id}-logo`}>{t("create.logo")}</label>
          <div className="drop">
            {logoUrl
              // eslint-disable-next-line @next/next/no-img-element -- local preview of a picked file
              ? <img src={logoUrl} alt="" width={64} height={64} />
              : <span className="drop-empty" aria-hidden="true">+</span>}
            <div style={{ minWidth: 0, flex: 1 }}>
              <input id={`${id}-logo`} type="file" accept={LOGO_TYPES.join(",")} onChange={(e) => pickLogo(e.target.files?.[0] ?? null)}
                aria-describedby={`${id}-logo-help${errors.logo ? ` ${id}-logo-err` : ""}`} aria-invalid={!!errors.logo} />
              <p className="help" id={`${id}-logo-help`} style={{ marginBottom: 0 }}>{t("create.logoHelp")}</p>
              {logo && <button type="button" className="link-btn" onClick={() => pickLogo(null)}>{t("create.logoRemove")}</button>}
            </div>
          </div>
          {err(errors.logo, `${id}-logo-err`)}
        </div>
      </section>

      <div className="action-bar">
        {errors.form && <p className="error-text" role="alert" style={{ flex: "1 1 100%", margin: 0 }}>{t(errors.form)}</p>}
        <button className="btn" type="submit" disabled={busy}>{busy ? t("create.submitting") : t("create.submit")}</button>
        <p className="note">{t("create.note")}</p>
      </div>
    </form>
  );
}
