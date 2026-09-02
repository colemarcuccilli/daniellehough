export const WEB_BUCKET = "portfolio-web";
export const ORIGINALS_BUCKET = "PortfolioPhotos";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

function encodePath(p: string) {
  return p.split("/").map(encodeURIComponent).join("/");
}

/** Public URL of a web derivative stored in the `portfolio-web` bucket. */
export function photoUrl(webPath: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/${WEB_BUCKET}/${encodePath(webPath)}`;
}

/** URL served through the Next.js image optimizer (for srcsets outside <Image>). */
export function optimizedUrl(webPath: string, width: number, quality = 85) {
  return `/_next/image?url=${encodeURIComponent(photoUrl(webPath))}&w=${width}&q=${quality}`;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Storage-safe object key for an uploaded file name. */
export function safeFileName(name: string) {
  const dot = name.lastIndexOf(".");
  const stem = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot + 1).toLowerCase() : "jpg";
  return `${slugify(stem) || "photo"}.${ext.replace(/[^a-z0-9]/g, "") || "jpg"}`;
}
