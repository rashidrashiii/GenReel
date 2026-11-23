import { NextResponse } from "next/server";

/** Error responses carry a message key from messages/*.json; the browser shows it in the user's language. */
export const fail = (status: number, error: string, details?: string[]) => NextResponse.json({ error, details }, { status });
export const ok = (body: unknown = { ok: true }) => NextResponse.json(body);
