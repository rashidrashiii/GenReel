"use client";
import { createContext, use } from "react";
import { format, type Dict, type Lang } from "@/lib/i18n";

const Ctx = createContext<{ lang: Lang; dict: Dict }>({ lang: "en", dict: {} });

export function I18nProvider({ lang, dict, children }: { lang: Lang; dict: Dict; children: React.ReactNode }) {
  return <Ctx value={{ lang, dict }}>{children}</Ctx>;
}

export function useT() {
  const { lang, dict } = use(Ctx);
  return { lang, t: (key: string, vars?: Record<string, string | number>) => format(dict, key, vars) };
}
