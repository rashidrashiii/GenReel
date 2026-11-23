import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n-server";
import { getSettings, languageAvailable } from "@/lib/settings";
import { Stepper } from "@/components/stepper";
import { CreateForm } from "./create-form";

export const metadata: Metadata = { title: "Make a video" };
export const dynamic = "force-dynamic";

export default async function CreatePage({ searchParams }: { searchParams: Promise<{ prompt?: string }> }) {
  const { t } = await getI18n();
  const sp = await searchParams;
  const s = await getSettings();
  const initialPrompt = typeof sp.prompt === "string" ? sp.prompt.slice(0, 1500) : "";
  const languages = (["en", "hi", "ml", "ta"] as const).map((code) => ({ code, available: languageAvailable(code, s) }));
  return (
    <>
      <Stepper current={0} />
      <div className="page-head">
        <h1>{t("create.title")}</h1>
        <p>{t("create.intro")}</p>
      </div>
      <div className="create-grid">
        <CreateForm initialPrompt={initialPrompt} initialLang={languageAvailable(s.language, s) ? s.language : "en"} languages={languages} />
        <aside className="create-aside" aria-label={t("create.asideLabel")}>
          <div className="aside-dark">
            <h2>{t("create.getTitle")}</h2>
            <ul>
              <li>{t("create.get1")}</li>
              <li>{t("create.get2")}</li>
              <li>{t("create.get3")}</li>
              <li>{t("create.get4")}</li>
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
