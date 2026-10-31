import type { SupabaseClient } from "@supabase/supabase-js";
import { derive } from "@/lib/photos/derive";
import { ORIGINALS_BUCKET, WEB_BUCKET, slugify } from "@/lib/images";
import type { Photo } from "@/lib/types";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Db = SupabaseClient<any, any, any>;

export class IngestError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

/**
 * Turns an original that already sits in the private originals bucket into a
 * web derivative + a `photos` row. Idempotent on `original_path`. Runs as
 * whichever signed-in admin `supabase` carries (RLS does the gatekeeping).
 */
export async function ingestOriginal(
  supabase: Db,
  opts: { projectId: string; projectSlug: string; coverPhotoId: string | null; originalPath: string; sectionId: string | null },
): Promise<{ photo: Photo; existed: boolean }> {
  const { projectId, projectSlug, originalPath } = opts;

  const { data: existing } = await supabase.from("photos").select("*").eq("original_path", originalPath).maybeSingle();
  if (existing) return { photo: existing as Photo, existed: true };

  const { data: blob, error: dlErr } = await supabase.storage.from(ORIGINALS_BUCKET).download(originalPath);
  if (dlErr || !blob) throw new IngestError(`Could not read original: ${dlErr?.message ?? "unknown"}`, 502);

  let derived;
  try {
    derived = await derive(Buffer.from(await blob.arrayBuffer()));
  } catch (e) {
    throw new IngestError(`Could not process image: ${e instanceof Error ? e.message : "unknown"}`, 422);
  }

  const base = originalPath.split("/").pop() ?? "photo";
  const stem = slugify(base.replace(/\.[^.]+$/, "")) || "photo";
  const webPath = `${projectSlug}/${stem}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const { error: upErr } = await supabase.storage
    .from(WEB_BUCKET)
    .upload(webPath, derived.large, { contentType: "image/jpeg", upsert: false, cacheControl: "31536000" });
  if (upErr) throw new IngestError(`Could not store derivative: ${upErr.message}`, 502);

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
      section_id: opts.sectionId,
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
    // Another run got there first: hand back its row instead of failing.
    if (/duplicate key/i.test(insErr.message)) {
      const { data: theirs } = await supabase.from("photos").select("*").eq("original_path", originalPath).maybeSingle();
      if (theirs) return { photo: theirs as Photo, existed: true };
    }
    throw new IngestError(insErr.message, 500);
  }

  if (!opts.coverPhotoId) {
    await supabase.from("projects").update({ cover_photo_id: photo.id }).eq("id", projectId).is("cover_photo_id", null);
  }
  return { photo: photo as Photo, existed: false };
}
