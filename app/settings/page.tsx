import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n-server";
import { HOME } from "@/lib/paths";
import { getSettings, MODELS, publicSettings } from "@/lib/settings";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { t } = await getI18n();
  return (
    <section className="narrow-col">
      <div className="page-head">
        <h1>{t("settings.title")}</h1>
        <p>{t("settings.intro")}</p>
      </div>
      <SettingsForm initial={publicSettings(await getSettings())} models={MODELS} home={HOME} />
    </section>
  );
}
