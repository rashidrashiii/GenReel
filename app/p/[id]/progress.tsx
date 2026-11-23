"use client";
import { useEffect, useState } from "react";
import { useT } from "@/components/i18n";
import type { Job, Project } from "./project-view";

// genreel and the Claude Code session write plain English stage lines (job.stage); map them onto the six steps the user sees.
const STEPS = ["check", "voice", "pictures", "video", "review", "finish"] as const;
const FROM_STAGE: Record<string, (typeof STEPS)[number]> = {
  "Checking your request": "check",
  Starting: "voice",
  "Recording the voice": "voice",
  "Preparing the scenes": "pictures",
  "Making the video": "video",
  "Checking the video": "review",
  Finishing: "finish",
  Done: "finish",
};
const STEP_FLOOR = [5, 15, 25, 72, 80, 92]; // minimum percent per step in STEPS
const QUIET_AFTER = 180; // s without any change (the runner checks in every 30 s while Claude Code runs)

export function Progress({ project, job, position, aspect = "9:16", onChange }: { project: Project; job: Job | null; position: number; aspect?: string; onChange: () => void }) {
  const { t } = useT();
  const queued = !job || job.status === "queued";
  const [stopping, setStopping] = useState(false);
  const current = queued ? -1 : STEPS.indexOf(FROM_STAGE[job?.stage ?? ""] ?? "check");

  // "Last update" uses this browser's clock (when anything about the job last changed), so a phone with a wrong clock still reads right.
  const [now, setNow] = useState<number | null>(null);
  const [mark, setMark] = useState<{ sig: string; at: number } | null>(null);
  const sig = `${job?.updated_at}|${job?.progress}|${job?.stage}|${job?.status}`;
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  if (now !== null && mark?.sig !== sig) setMark({ sig, at: now });
  const since = now && mark ? Math.max(0, Math.round((now - mark.at) / 1000)) : 0;
  const start = job?.created_at ? new Date(job.created_at).getTime() : null;
  const elapsed = start && now ? Math.max(0, Math.round((now - start) / 1000)) : 0;
  // The bar never lags the step shown below it (a session may not report percentages).
  const pct = Math.max(0, Math.min(100, Math.max(job?.progress ?? 0, STEP_FLOOR[current] ?? 0)));

  return (
    <section className="result-grid">
      <div className={`phone-frame skeleton${aspect === "16:9" ? " wide" : aspect === "1:1" ? " square" : ""}`} aria-hidden="true"><div /></div>
      <div>
        <div className="page-head">
          <h1>{t("progress.title")}</h1>
          <p aria-live="polite">{queued ? (position > 0 ? t("progress.inLine", { n: position }) : t("progress.waiting")) : t(`progress.stage.${STEPS[current]}`)}</p>
        </div>
        {!queued && (
          <div className="panel render-meter">
            <div className="render-meter-row">
              <strong>{t("progress.percent", { n: pct })}</strong>
              <span className="muted">{t("progress.elapsed", { m: Math.floor(elapsed / 60), s: elapsed % 60 })}</span>
            </div>
            <progress max={100} value={pct} aria-label={t("progress.title")}>{pct}%</progress>
            <p className={`alive${since >= QUIET_AFTER ? " is-quiet" : ""}`}>
              <span className="alive-dot" aria-hidden="true" />
              {since >= QUIET_AFTER
                ? t("progress.quiet", { m: Math.floor(since / 60) })
                : since < 60 ? t("progress.alive", { s: since }) : t("progress.aliveMin", { m: Math.floor(since / 60) })}
            </p>
          </div>
        )}
        <div className="panel">
          <ol className="stages" style={{ margin: 0 }}>
            {STEPS.map((s, i) => (
              <li key={s} data-state={i < current ? "done" : i === current ? "now" : "todo"} aria-current={i === current ? "step" : undefined}>
                {t(`progress.stage.${s}`)}
              </li>
            ))}
          </ol>
        </div>
        <p style={{ marginTop: 16 }}>{t("progress.time")}</p>
        <p className="muted">{t("progress.closeOk")}</p>
        <button className="link-btn danger" disabled={stopping} onClick={async () => {
          if (!confirm(t("progress.stopConfirm"))) return;
          setStopping(true);
          await fetch(`/api/projects/${project.id}/stop`, { method: "POST" }).catch(() => null);
          onChange();
        }}>{t("progress.stop")}</button>
      </div>
    </section>
  );
}
