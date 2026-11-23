"use client";
import { useT } from "./i18n";

/** Describe -> Check the script -> Get the video. `current` is 0, 1 or 2; earlier steps show as done. */
export function Stepper({ current }: { current: 0 | 1 | 2 | 3 }) {
  const { t } = useT();
  const steps = [t("steps.describe"), t("steps.check"), t("steps.get")];
  return (
    <ol className="stepper" aria-label={t("steps.label")}>
      {steps.map((s, i) => (
        <li key={s} data-state={i < current ? "done" : i === current ? "now" : "todo"} aria-current={i === current ? "step" : undefined}><span>{s}</span></li>
      ))}
    </ol>
  );
}
