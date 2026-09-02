import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdmin } from "@/lib/admin";
import { derive } from "@/lib/photos/derive";
import { ORIGINALS_BUCKET, WEB_BUCKET, slugify } from "@/lib/images";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({
  projectId: z.string().uuid(),
  originalPath: z.string().min(1).max(500),
});

/**
 * Turns an original that already sits in the private PortfolioPhotos bucket
 * into a web derivative + a `photos` row. The browser uploads the original
 * directly to Supabase first (no Vercel body limits), then calls this.
 */
export async function POST(request: Request) {
  const ctx = await getAdmin();
  if (!ctx) return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  const { supabase } = ctx;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const { projectId, originalPath } = parsed.data;

  const { data: project } = await supabase.from("projects").select("id, slug, cover_photo_id").eq("id", projectId).maybeSingle();
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const { data: existing } = await supabase.from("photos").select("*").eq("original_path", originalPath).maybeSingle();
  if (existing) return NextResponse.json({ photo: existing, existed: true });

  const { data: blob, error: dlErr } = await supabase.storage.from(ORIGINALS_BUCKET).download(originalPath);
  if (dlErr || !blob) return NextResponse.json({ error: `Could not read original: ${dlErr?.message ?? "unknown"}` }, { status: 502 });

  let derived;
  try {
    derived = await derive(Buffer.from(await blob.arrayBuffer()));
  } catch (e) {
    return NextResponse.json({ error: `Could not process image: ${e instanceof Error ? e.message : "unknown"}` }, { status: 422 });
  }

  const base = originalPath.split("/").pop() ?? "photo";
  const stem = slugify(base.replace(/\.[^.]+$/, "")) || "photo";
  const webPath = `${project.slug}/${stem}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const { error: upErr } = await supabase.storage
    .from(WEB_BUCKET)
    .upload(webPath, derived.large, { contentType: "image/jpeg", upsert: false, cacheControl: "31536000" });
  if (upErr) return NextResponse.json({ error: `Could not store derivative: ${upErr.message}` }, { status: 502 });

  const { data: last } = await supabase
    .from("photos")
    .select("sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: photo, error: insErr } = await supabase
    .from("photos")
    .insert({
      project_id: projectId,
      original_path: originalPath,
      web_path: webPath,
      width: derived.width,
      height: derived.height,
      bytes: derived.bytes,
      blur_data_url: derived.blurDataUrl,
      dominant_color: derived.dominantColor,
      taken_at: derived.takenAt,
      sort_order: ((last?.sort_order as number | undefined) ?? 0) + 1,
      alt: null,
    })
    .select("*")
    .single();
  if (insErr) {
    await supabase.storage.from(WEB_BUCKET).remove([webPath]);
    return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  if (!project.cover_photo_id) {
    await supabase.from("projects").update({ cover_photo_id: photo.id }).eq("id", projectId);
  }

  revalidatePath("/", "layout");
  revalidatePath(`/admin/projects/${projectId}`);
  return NextResponse.json({ photo });
}
