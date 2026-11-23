import Link from "next/link";
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n-server";
import { budgetFor } from "@/lib/draft";
import { queuePosition } from "@/lib/jobs";
import { getProject } from "@/lib/store";
import { ProjectView } from "./project-view";

export const metadata: Metadata = { title: "Your video" };
export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { t } = await getI18n();
  const project = await getProject(id);
  if (!project) return <><h1>{t("errors.notFound")}</h1><p><Link href="/">{t("nav.videos")}</Link></p></>;
  return <ProjectView initial={{ project, position: queuePosition(id) }} maxNarrationChars={budgetFor(project)} />;
}
