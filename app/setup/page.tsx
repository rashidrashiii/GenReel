import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n-server";
import { checks, currentTask, ready } from "@/lib/setup";
import { SetupList } from "./setup-list";

export const metadata: Metadata = { title: "Setup" };
export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const { t } = await getI18n();
  const cs = await checks();
  return (
    <section className="narrow-col">
      <div className="page-head">
        <h1>{t("setup.title")}</h1>
        <p>{t("setup.intro")}</p>
      </div>
      <SetupList initial={{ checks: cs, ready: ready(cs), task: currentTask() }} platform={process.platform} />
    </section>
  );
}
