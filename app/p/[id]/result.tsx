"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/i18n";
import type { Project } from "./project-view";

/** Where a project's finished files are served from (cache-busted per render). */
export const fileUrl = (p: Project, name: "video.mp4" | "thumb.jpg") => `/api/projects/${p.id}/file/${name}?v=${encodeURIComponent(p.video?.made_at ?? "")}`;

export function Result({ project, onChange }: { project: Project; onChange: () => void }) {
  const { t } = useT();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function post(path: string, method = "POST") {
    setBusy(true); setError(null);
    const res = await fetch(`/api/projects/${project.id}${path}`, { method }).catch(() => null);
    setBusy(false);
    if (!res?.ok) { setError((await res?.json().catch(() => null))?.error ?? "errors.network"); return false; }
    return true;
  }
  const frame = project.aspect === "16:9" ? " wide" : project.aspect === "1:1" ? " square" : "";

  return (
    <section className="result-grid">
      {/* The frame is sized before the video loads, so nothing jumps. */}
      <div className={`phone-frame${frame}`}>
        <video src={fileUrl(project, "video.mp4")} poster={project.video?.thumb ? fileUrl(project, "thumb.jpg") : undefined} controls playsInline preload="metadata" />
      </div>

      <div>
        <div className="page-head">
          <span className="badge ready">{t("result.ready")}</span>
          <h1 style={{ marginTop: 12 }}>{project.title}</h1>
          <p>{t("result.savedNote")}</p>
        </div>

        <div className="panel result-actions">
          <a className="btn" href={`${fileUrl(project, "video.mp4")}&download=1`} download>{t("result.download")}</a>
          <button className="btn btn-secondary" disabled={busy} onClick={() => void post("/open")}>{t("result.openFolder")}</button>
          <button className="btn btn-secondary" disabled={busy} onClick={async () => { if (await post("/edit")) onChange(); }}>{t("result.change")}</button>
          <button className="link-btn danger" disabled={busy} onClick={async () => {
            if (!confirm(t("result.deleteConfirm"))) return;
            if (await post("", "DELETE")) { router.push("/"); router.refresh(); }
          }}>{t("result.delete")}</button>
          {error && <p className="error-text" role="alert" style={{ margin: 0 }}>{t(error)}</p>}
        </div>
      </div>
    </section>
  );
}
