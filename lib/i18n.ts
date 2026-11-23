// Client-safe i18n helpers. The server passes the dictionary down (lib/i18n-server.ts).
export type Lang = "en" | "ml";
export type Dict = Record<string, string>;

/** Look up a string and fill {placeholders}. */
export function format(d: Dict, key: string, vars: Record<string, string | number> = {}) {
  const s = d[key] ?? key;
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}
