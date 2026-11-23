"use client";
import { useT } from "@/components/i18n";
import type { Project } from "./project-view";
import { fileUrl } from "./result";

// While someone edits the script of a video they already made, keep that video in view.
// It is only replaced when a new video finishes.
export function CurrentVideo({ project }: { project: Project }) {
  const { t } = useT();
  if (!project.video) return null;
  return (
    <details className="panel current-video" open>
      <summary>{t("review.current")}</summary>
      <video src={fileUrl(project, "video.mp4")} poster={project.video.thumb ? fileUrl(project, "thumb.jpg") : undefined} controls playsInline preload="metadata" />
      <p className="small muted">{t("review.currentNote")}</p>
    </details>
  );
}
