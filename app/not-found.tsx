import Link from "next/link";
import { getI18n } from "@/lib/i18n-server";

export default async function NotFound() {
  const { t } = await getI18n();
  return (
    <section className="narrow-col">
      <h1>{t("notFound.title")}</h1>
      <p>{t("notFound.body")}</p>
      <p className="actions"><Link className="btn" href="/create">{t("nav.make")}</Link> <Link href="/">{t("notFound.home")}</Link></p>
    </section>
  );
}
