// genreel can start Claude Code sessions that run commands on this computer, so only genreel's own page may talk
// to it. Any other website open in the same browser could otherwise send requests to localhost.
//  * Host must be localhost / 127.0.0.1 / [::1] (stops DNS-rebinding sites from reading or driving the app).
//  * The API only answers our own page: changes need our Origin; reads are refused when the browser marks them cross-site.
//  * Plain page visits from elsewhere (a link in the README) are fine: another site cannot read the page.
import { NextResponse, type NextRequest } from "next/server";

const LOCAL = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;
const SAFE = new Set(["GET", "HEAD", "OPTIONS"]);

export function isAllowed(r: { method: string; path: string; host: string | null; origin: string | null; fetchSite: string | null }) {
  if (!r.host || !LOCAL.test(r.host)) return false;
  if (SAFE.has(r.method)) return !r.path.startsWith("/api/") || r.fetchSite !== "cross-site";
  if (r.origin) { try { return new URL(r.origin).host === r.host; } catch { return false; } }
  return r.fetchSite === "same-origin"; // no Origin header: only trust the browser's own same-origin marker
}

export function proxy(req: NextRequest) {
  const h = req.headers;
  const ok = isAllowed({ method: req.method, path: req.nextUrl.pathname, host: h.get("host"), origin: h.get("origin"), fetchSite: h.get("sec-fetch-site") });
  return ok ? NextResponse.next() : new NextResponse("Forbidden", { status: 403 });
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
