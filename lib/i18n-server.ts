import "server-only";
import en from "@/messages/en.json";
import { format, type Dict } from "./i18n";

// The interface is English for now; messages/ml.json is kept for when a language switch comes back.
const dict: Dict = en;

export async function getI18n() {
  return { lang: "en" as const, dict, t: (key: string, vars?: Record<string, string | number>) => format(dict, key, vars) };
}
