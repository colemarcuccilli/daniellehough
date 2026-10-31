import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import { ORIGINALS_BUCKET } from "@/lib/images";
import { downloadFileName } from "@/lib/gallery";

export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SIGNED_TTL = 60 * 60; // seconds

/**
 * Full-quality download for a client gallery photo. Anyone with the gallery
 * link may call this; it only works while the project's gallery is enabled
 * with downloads on, which is also what the storage policy for `vh-originals`
 * checks. Redirects to a short-lived signed URL (Content-Disposition:
 * attachment), or returns it as JSON for the in-browser zip builder.
 */
export async function GET(request: Request, { params }: { params: Promise<{ slug: string; photoId: string }> }) {
  const { slug, photoId } = await params;
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || !UUID.test(photoId)) return notFound();

  const supabase = createPublicClient();
  const { data: project } = await supabase
    .from("projects")
    .select("id, title, gallery_enabled, gallery_downloads")
    .eq("gallery_slug", slug)
    .maybeSingle();
  if (!project || !project.gallery_enabled || !project.gallery_downloads) return notFound();

  const { data: photo } = await supabase
    .from("photos")
    .select("id, original_path, is_published")
    .eq("id", photoId)
    .eq("project_id", project.id)
    .maybeSingle();
  if (!photo || !photo.is_published) return notFound();

  const filename = downloadFileName(project.title as string, photo.original_path as string);
  const { data, error } = await supabase.storage
    .from(ORIGINALS_BUCKET)
    .createSignedUrl(photo.original_path as string, SIGNED_TTL, { download: filename });
  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: `Could not sign download: ${error?.message ?? "unknown"}` }, { status: 502, headers: noStore });
  }

  const wantsJson = new URL(request.url).searchParams.get("format") === "json";
  if (wantsJson) return NextResponse.json({ url: data.signedUrl, filename }, { headers: noStore });
  return NextResponse.redirect(data.signedUrl, { status: 302, headers: noStore });
}

const noStore = { "Cache-Control": "private, no-store" };

function notFound() {
  return NextResponse.json({ error: "Not found" }, { status: 404, headers: noStore });
}
