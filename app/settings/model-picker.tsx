"use client";
import { useId, useState } from "react";
import { useT } from "@/components/i18n";

export type Model = { id: string; name: string; note: string; speed: string; use: string; older?: boolean };

/** Radio cards for choosing a Claude model, plus "Custom model ID" for anything Claude Code accepts that is not listed. */
export function ModelPicker({ legend, help, value, models, disabled, onChange }: {
  legend: string; help: string; value: string; models: Model[]; disabled?: boolean; onChange: (id: string) => Promise<boolean>;
}) {
  const { t } = useT();
  const id = useId();
  const listed = models.some((m) => m.id === value);
  const [custom, setCustom] = useState(listed ? "" : value);
  const [customOpen, setCustomOpen] = useState(!listed);
  const current = models.filter((m) => !m.older), older = models.filter((m) => m.older);
  const [showOther, setShowOther] = useState(customOpen || older.some((m) => m.id === value));

  const card = (m: Model) => (
    <label key={m.id} className="model-card">
      <input type="radio" name={id} value={m.id} checked={!customOpen && value === m.id} disabled={disabled}
        onChange={() => { setCustomOpen(false); void onChange(m.id); }} />
      <span className="model-body">
        <span className="model-top">
          <strong>{m.name}</strong>
          <span className="model-tags">
            <span className="model-tag">{t("settings.speed", { v: m.speed })}</span>
            <span className="model-tag">{t("settings.planUse", { v: m.use })}</span>
          </span>
        </span>
        <span className="model-note">{m.note}</span>
        <code className="model-id">{m.id}</code>
      </span>
    </label>
  );

  return (
    <fieldset className="model-picker" aria-describedby={`${id}-help`}>
      <legend>{legend}</legend>
      <p className="help" id={`${id}-help`}>{help}</p>
      <div className="model-cards">{current.map(card)}</div>
      <button type="button" className="link-btn model-more" aria-expanded={showOther} onClick={() => setShowOther(!showOther)}>
        {showOther ? t("settings.fewerModels") : t("settings.otherModels")}
      </button>
      {showOther && (
        <div className="model-cards">
          {older.map(card)}
          <label className="model-card">
            <input type="radio" name={id} value="custom" checked={customOpen} disabled={disabled} onChange={() => setCustomOpen(true)} />
            <span className="model-body">
              <span className="model-top"><strong>{t("settings.customModel")}</strong></span>
              <span className="model-note">{t("settings.customModelHelp")}</span>
            </span>
          </label>
        </div>
      )}
      {customOpen && (
        <div className="model-custom">
          <label htmlFor={`${id}-custom`} className="visually-hidden">{t("settings.customModel")}</label>
          <input id={`${id}-custom`} type="text" spellCheck={false} autoComplete="off" placeholder="claude-…" value={custom}
            onChange={(e) => setCustom(e.target.value)} disabled={disabled} />
          <button type="button" className="btn btn-secondary" disabled={disabled || !custom.trim()} onClick={() => void onChange(custom.trim())}>
            {t("settings.useModel")}
          </button>
        </div>
      )}
    </fieldset>
  );
}
