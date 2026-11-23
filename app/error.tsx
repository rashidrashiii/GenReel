"use client";
import Link from "next/link";
import { useT } from "@/components/i18n";

// Unexpected error inside a page: say what happened and what to do; never show the stack.
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  const { t } = useT();
  return (
    <main id="main" tabIndex={-1} className="doc">
      <h1>{t("errorPage.title")}</h1>
      <p>{t("errorPage.body")}</p>
      <p className="actions"><button className="btn" onClick={reset}>{t("failed.retry")}</button><Link href="/">{t("notFound.home")}</Link></p>
    </main>
  );
}
