"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Project } from "@/lib/store";
import { useT } from "@/components/i18n";
import { Stepper } from "@/components/stepper";
import { ScriptEditor } from "./script-editor";
import { Progress } from "./progress";
import { DraftWaiting } from "./draft-waiting";
import { Result } from "./result";

export type { Project, Job } from "@/lib/store";
type Data = { project: Project; position: number };

export function ProjectView({ initial, maxNarrationChars }: { initial: Data; maxNarrationChars: number }) {
  const [data, setData] = useState<Data>(initial);
  const busy = useRef(false);
  const id = initial.project.id;

  const refresh = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      const res = await fetch(`/api/projects/${id}`, { cache: "no-store" });
      if (res.ok) setData(await res.json());
    } finally { busy.current = false; }
  }, [id]);

  // Everything is on this computer, so polling every 2 s while something is being made is cheap and simple.
  const working = ["draft_pending", "render_pending"].includes(data.project.state);
  useEffect(() => {
    if (!working) return;
    const timer = setInterval(() => void refresh(), 2000);
    return () => clearInterval(timer);
  }, [working, refresh]);

  const { project, position } = data;
  switch (project.state) {
    case "draft_pending":
      return <><Stepper current={1} /><DraftWaiting project={project} job={project.job} /></>;
    case "draft_ready":
      return <><Stepper current={1} /><ScriptEditor project={project} onRendered={refresh} maxNarrationChars={maxNarrationChars} /></>;
    case "render_pending":
      return <><Stepper current={2} /><Progress project={project} job={project.job} position={position} aspect={project.aspect} onChange={refresh} /></>;
    case "ready":
      return <><Stepper current={2} /><Result project={project} onChange={refresh} /></>;
    default:
      return <Failed project={project} onRetry={refresh} />;
  }
}

function Failed({ project, onRetry }: { project: Project; onRetry: () => void }) {
  const { t } = useT();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const post = async (path: string) => {
    setBusy(true); setError(null);
    const res = await fetch(`/api/projects/${project.id}/${path}`, { method: "POST" }).catch(() => null);
    if (!res?.ok) { setError((await res?.json().catch(() => null))?.error ?? "errors.network"); setBusy(false); return; }
    onRetry();
  };
  const msg = project.job?.error ?? "errors.failed";
  return (
    <section className="narrow-col">
      <div className="page-head"><h1>{project.title || t("progress.title")}</h1></div>
      {/* Session messages are plain sentences; ours are message keys. */}
      <p className="notice error" role="alert">{msg.startsWith("errors.") ? t(msg) : msg}</p>
      {error && <p className="error-text">{t(error)}</p>}
      <div className="action-bar">
        {project.scenes
          ? <>
              <button className="btn" onClick={() => post("render")} disabled={busy}>{t("failed.retry")}</button>
              <button className="btn btn-secondary" onClick={() => post("edit")} disabled={busy}>{t("failed.edit")}</button>
            </>
          : <>
              <button className="btn" onClick={() => post("retry")} disabled={busy}>{t("failed.retryScript")}</button>
              <Link className="btn btn-secondary" href="/create">{t("failed.new")}</Link>
            </>}
      </div>
    </section>
  );
}
