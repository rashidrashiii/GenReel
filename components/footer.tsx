import { ABOUT } from "@/lib/about";
import { getI18n } from "@/lib/i18n-server";
import { Logo } from "./logo";

/** On every screen: what genreel is, who made it, where the code lives. */
export async function Footer() {
  const { t } = await getI18n();
  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        <Logo size={22} />
        <p>
          {t("footer.free")}{" "}
          {t("footer.madeBy")} <a href={ABOUT.authorUrl} target="_blank" rel="noreferrer">@{ABOUT.author}</a>.
        </p>
        <nav aria-label={t("footer.label")}>
          <a href={ABOUT.repo} target="_blank" rel="noreferrer">{t("footer.source")}</a>
          <a href={ABOUT.issues} target="_blank" rel="noreferrer">{t("footer.issue")}</a>
        </nav>
      </div>
    </footer>
  );
}
