import { slugify } from "@/lib/images";

const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

/** Unguessable, lowercase share token that satisfies the `gallery_slug` check. */
export function randomGallerySlug(length = 12) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return out;
}

export function galleryPath(slug: string) {
  return `/gallery/${slug}`;
}

export function galleryUrl(slug: string) {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://danicams.com").replace(/\/$/, "");
  return `${base}${galleryPath(slug)}`;
}

/** Route that redirects to a short-lived signed URL for the original file. */
export function downloadPath(slug: string, photoId: string) {
  return `/api/gallery/${slug}/${photoId}`;
}

/** File name guests get: project title + the original file name. */
export function downloadFileName(projectTitle: string, originalPath: string) {
  const base = originalPath.split("/").pop() ?? "photo.jpg";
  const dot = base.lastIndexOf(".");
  const stem = dot > 0 ? base.slice(0, dot) : base;
  const ext = dot > 0 ? base.slice(dot + 1).toLowerCase() : "jpg";
  const prefix = slugify(projectTitle).slice(0, 40);
  const safeStem = stem.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "photo";
  return `${prefix ? `${prefix}-` : ""}${safeStem}.${ext}`;
}
