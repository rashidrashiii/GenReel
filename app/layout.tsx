import type { Metadata, Viewport } from "next";
import { Archivo, Noto_Sans_Malayalam, Source_Sans_3 } from "next/font/google";
import { getI18n } from "@/lib/i18n-server";
import { I18nProvider } from "@/components/i18n";
import { AppHeader } from "@/components/headers";
import "./globals.css";
import "./app.css";

const latin = Source_Sans_3({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-latin", display: "swap" });
const display = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-display", display: "swap" });
const malayalam = Noto_Sans_Malayalam({ subsets: ["malayalam"], weight: ["400", "600", "800"], variable: "--font-ml", display: "swap" });

export const metadata: Metadata = {
  title: { default: "genreel", template: "%s | genreel" },
  description: "Describe a video, check the script, and your own Claude Code makes a narrated, captioned animated video on your computer.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0E1A14" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { lang, dict, t } = await getI18n();
  return (
    <html lang={lang} className={`${latin.variable} ${malayalam.variable} ${display.variable}`}>
      <body>
        <I18nProvider lang={lang} dict={dict}>
          <a href="#main" className="skip-link">{t("nav.skip")}</a>
          <div className="app-shell">
            <AppHeader />
            <main className="app-main" id="main" tabIndex={-1}>{children}</main>
          </div>
        </I18nProvider>
      </body>
    </html>
  );
}
