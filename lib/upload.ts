"use client";

export const LOGO_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_UPLOAD = 5 * 1024 * 1024;

/** Save a picked image into ~/genreel/uploads; returns the "local/<name>" path scripts use. */
export async function uploadImage(file: File, kind: "logo" | "photo") {
  const form = new FormData();
  form.set("file", file);
  form.set("kind", kind);
  const res = await fetch("/api/uploads", { method: "POST", body: form }).catch(() => null);
  const body = await res?.json().catch(() => ({}));
  if (!res?.ok) throw new Error(body?.error || "create.logoTooBig");
  return body.path as string;
}

/** Browser URL for an uploaded image path ("local/photo-ab12cd34.jpg"). */
export const uploadUrl = (path: string) => `/api/uploads/${path.split("/").pop()}`;
