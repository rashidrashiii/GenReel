import Link from "next/link";
import { getI18n } from "@/lib/i18n-server";

/** The bar on every screen: your videos, settings, and the one button that starts a new video. */
export async function AppHeader() {
  const { t } = await getI18n();
  return (
    <header className="top is-dark">
      <div className="top-inner">
        <Link href="/" className="wordmark">{t("site")}</Link>
        <nav aria-label="Main" className="top-nav">
          <Link href="/" className="hide-sm">{t("nav.videos")}</Link>
          <Link href="/settings">{t("nav.settings")}</Link>
          <Link href="/create" className="top-cta">{t("nav.make")}</Link>
        </nav>
      </div>
    </header>
  );
}
