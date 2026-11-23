import Link from "next/link";
import { redirect } from "next/navigation";
import { checks, ready } from "@/lib/setup";
import { getI18n } from "@/lib/i18n-server";
import { listProjects } from "@/lib/store";

export const dynamic = "force-dynamic";

const BADGE: Record<string, string> = { draft_pending: "working", draft_ready: "draft", render_pending: "working", ready: "ready", failed: "failed" };

/** Home: every video made on this computer, newest first. */
export default async function Home() {
  const { t } = await getI18n();
  const projects = await listProjects();
  // First run: nothing made yet and something needed is missing, so start at Setup.
  if (!projects.length && !ready(await checks())) redirect("/setup");
  const date = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" });
  return (
    <>
      <div className="page-head">
        <h1>{t("videos.title")}</h1>
        <p>{t("videos.subtitle")}</p>
      </div>
      {!projects.length ? (
        <div className="panel empty">
          <p>{t("videos.empty")}</p>
          <Link className="btn" href="/create">{t("videos.new")}</Link>
        </div>
      ) : (
        <ul className="video-grid">
          <li>
            <Link className="video-card new-card" href="/create">
              <span className="poster"><span><span aria-hidden="true">+</span>{t("videos.newCard")}</span></span>
            </Link>
          </li>
          {projects.map((p) => {
            const title = p.title || p.prompt.slice(0, 60);
            return (
              <li key={p.id}>
                <Link className="video-card" href={`/p/${p.id}`}>
                  <span className="poster">
                    {p.video?.thumb
                      // eslint-disable-next-line @next/next/no-img-element -- local file
                      ? <img src={`/api/projects/${p.id}/file/thumb.jpg?v=${encodeURIComponent(p.video.made_at)}`} alt="" width={180} height={320} />
                      : <span className="ph" aria-hidden="true">{title}</span>}
                    <span className={`badge ${BADGE[p.state] ?? "draft"}`}>{t(`videos.badge.${p.state}`)}</span>
                  </span>
                  <span className="vc-title">{title}</span>
                  <span className="vc-meta">{date.format(new Date(p.created_at))}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
