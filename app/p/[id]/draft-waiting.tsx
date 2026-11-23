"use client";
import { useEffect, useState } from "react";
import { useT } from "@/components/i18n";
import type { Job, Project } from "./project-view";

// "Writing your script": real steps from the job, elapsed time, the idea being made, a preview of shots building up,
// and what happens next. The worker's draft stages are "Checking your request" then "Writing the script".
const STEPS = ["check", "write", "ready"] as const;

function stepIndex(job: Job | null) {
  if (!job || job.status === "queued") return -1; // waiting for a free slot
  return job.stage === "Writing the script" ? 1 : 0;
}

export function DraftWaiting({ project, job }: { project: Project; job: Job | null }) {
  const { t } = useT();
  const start = job?.created_at ? new Date(job.created_at).getTime() : null;
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  const secs = start && now ? Math.max(0, Math.round((now - start) / 1000)) : 0;
  const at = stepIndex(job);
  const slow = secs > 75;
  const shots = Math.min(3, 1 + Math.floor(secs / 6)); // preview cards appear one by one while writing

  return (
    <section aria-live="polite" className="draft-wait">
      <div className="draft-grid">
        <div>
          <div className="page-head">
            <h1>{t("draft.waiting")}</h1>
            <p>{t("draft.waitingHelp")}</p>
          </div>

          <div className="panel">
            <ol className="stages draft-stages">
              {at === -1 && <li data-state="now">{t("progress.waiting")}</li>}
              {STEPS.map((s, i) => (
                <li key={s} data-state={i < at ? "done" : i === at ? "now" : "todo"}>{t(`draft.step.${s}`)}</li>
              ))}
            </ol>
            <p className="draft-time" aria-live="off">
              <span className="spinner" aria-hidden="true" />
              {t("draft.elapsed", { s: secs })}
            </p>
            {slow && <p className="notice">{t("draft.slow")}</p>}
          </div>

          <div className="panel">
            <h2 className="panel-h">{t("draft.yourIdea")}</h2>
            <blockquote className="draft-idea" lang={project.language}>{project.prompt}</blockquote>
            <p className="draft-tags">
              <span>{project.language === "ml" ? "മലയാളം" : "English"}</span>
              <span>{t("create.seconds", { n: project.target_seconds })}</span>
              <span>{t(`create.shape.${project.aspect}`)}</span>
            </p>
          </div>

          <div className="panel">
            <h2 className="panel-h">{t("draft.nextTitle")}</h2>
            <ul className="draft-next">
              <li>{t("draft.next1")}</li>
              <li>{t("draft.next2")}</li>
              <li>{t("draft.next3")}</li>
            </ul>
          </div>
        </div>

        <aside className="draft-preview" aria-hidden="true">
          <p className="draft-preview-label">{t("draft.previewLabel")}</p>
          {[0, 1, 2].map((i) => (
            <div key={i} className={`shot-ghost${i < shots ? " is-in" : ""}`}>
              <span className="shot-n">{i + 1}</span>
              <span className="ghost-lines"><i /><i /></span>
              <span className="ghost-pic" />
            </div>
          ))}
        </aside>
      </div>
    </section>
  );
}
