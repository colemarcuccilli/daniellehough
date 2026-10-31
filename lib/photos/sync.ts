import { ORIGINALS_BUCKET } from "@/lib/images";
import { ingestOriginal, type Db } from "@/lib/photos/ingest";

/**
 * Reconciles the originals bucket with the site for client-gallery projects:
 * every image under `<project-slug>/` (no section) or
 * `<project-slug>/<section-slug>/` that has no `photos` row yet gets
 * processed. Concurrent runs coordinate through `vh.import_claims`, so a
 * storage poke, the cron sweep and an admin "Sync now" can overlap safely.
 */
export type SyncSummary = {
  projects: string[];
  scanned: number;
  missing: number;
  processed: number;
  failed: { path: string; error: string }[];
  skipped_folders: string[];
  remaining: number;
  ms: number;
};

const IMAGE_RE = /\.(jpe?g|png|webp|tiff?)$/i;
const CLAIM_STALE_MIN = 15;
const FAILED_RETRY_MIN = 60;

type Candidate = { path: string; projectId: string; projectSlug: string; coverPhotoId: string | null; sectionId: string | null };

async function listFolder(supabase: Db, prefix: string): Promise<{ files: string[]; folders: string[] }> {
  const files: string[] = [];
  const folders: string[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.storage.from(ORIGINALS_BUCKET).list(prefix, { limit: 1000, offset, sortBy: { column: "name", order: "asc" } });
    if (error) throw new Error(`list ${prefix}: ${error.message}`);
    for (const o of data ?? []) {
      if (o.name.startsWith(".")) continue;
      if (o.id === null) folders.push(o.name);
      else if (IMAGE_RE.test(o.name)) files.push(`${prefix}/${o.name}`);
    }
    if (!data || data.length < 1000) break;
  }
  return { files, folders };
}

async function selectAll<T>(run: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await run(from, from + 999);
    if (error) throw new Error(error.message);
    out.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  return out;
}

export async function syncGalleryFolders(
  supabase: Db,
  opts: { projectId?: string; budgetMs: number; concurrency?: number; maxFiles?: number },
): Promise<SyncSummary> {
  const started = Date.now();
  const concurrency = opts.concurrency ?? 3;

  let q = supabase.from("projects").select("id, slug, cover_photo_id, gallery_enabled");
  q = opts.projectId ? q.eq("id", opts.projectId) : q.eq("gallery_enabled", true);
  const { data: projects, error: pErr } = await q;
  if (pErr) throw new Error(pErr.message);
  const list = (projects ?? []) as { id: string; slug: string; cover_photo_id: string | null }[];
  const summary: SyncSummary = { projects: list.map((p) => p.slug), scanned: 0, missing: 0, processed: 0, failed: [], skipped_folders: [], remaining: 0, ms: 0 };
  if (list.length === 0) return { ...summary, ms: Date.now() - started };
  const ids = list.map((p) => p.id);

  const { data: sections, error: sErr } = await supabase.from("sections").select("id, slug, project_id").in("project_id", ids);
  if (sErr) throw new Error(sErr.message);
  const sectionsOf = new Map<string, { id: string; slug: string }[]>();
  for (const s of (sections ?? []) as { id: string; slug: string; project_id: string }[]) {
    sectionsOf.set(s.project_id, [...(sectionsOf.get(s.project_id) ?? []), { id: s.id, slug: s.slug }]);
  }

  // Everything in the bucket that belongs to a project or one of its sections.
  const candidates: Candidate[] = [];
  for (const p of list) {
    const root = await listFolder(supabase, p.slug);
    for (const f of root.files) candidates.push({ path: f, projectId: p.id, projectSlug: p.slug, coverPhotoId: p.cover_photo_id, sectionId: null });
    const secs = sectionsOf.get(p.id) ?? [];
    for (const folder of root.folders) {
      const sec = secs.find((s) => s.slug === folder);
      if (!sec) {
        summary.skipped_folders.push(`${p.slug}/${folder}`);
        continue;
      }
      const inner = await listFolder(supabase, `${p.slug}/${folder}`);
      for (const f of inner.files) candidates.push({ path: f, projectId: p.id, projectSlug: p.slug, coverPhotoId: p.cover_photo_id, sectionId: sec.id });
    }
  }
  summary.scanned = candidates.length;

  const existing = new Set(
    (await selectAll<{ original_path: string }>((from, to) => supabase.from("photos").select("original_path").in("project_id", ids).range(from, to))).map(
      (r) => r.original_path,
    ),
  );

  // Drop stale claims (crashed runs) and old failures, then skip whatever is still claimed.
  const now = Date.now();
  await supabase.from("import_claims").delete().is("error", null).lt("claimed_at", new Date(now - CLAIM_STALE_MIN * 60_000).toISOString());
  await supabase.from("import_claims").delete().not("error", "is", null).lt("claimed_at", new Date(now - FAILED_RETRY_MIN * 60_000).toISOString());
  const claimed = new Set((await selectAll<{ original_path: string }>((from, to) => supabase.from("import_claims").select("original_path").range(from, to))).map((r) => r.original_path));

  const queue = candidates.filter((c) => !existing.has(c.path) && !claimed.has(c.path)).sort((a, b) => a.path.localeCompare(b.path, undefined, { numeric: true }));
  summary.missing = queue.length;
  const limit = Math.min(queue.length, opts.maxFiles ?? Number.POSITIVE_INFINITY);

  let next = 0;
  const worker = async () => {
    while (next < limit && Date.now() - started < opts.budgetMs) {
      const c = queue[next++];
      const { data: claim } = await supabase
        .from("import_claims")
        .upsert({ original_path: c.path, claimed_at: new Date().toISOString(), error: null }, { onConflict: "original_path", ignoreDuplicates: true })
        .select("original_path");
      if (!claim || claim.length === 0) continue; // someone else has it
      try {
        const { existed } = await ingestOriginal(supabase, { projectId: c.projectId, projectSlug: c.projectSlug, coverPhotoId: c.coverPhotoId, originalPath: c.path, sectionId: c.sectionId });
        if (!existed) summary.processed++;
        await supabase.from("import_claims").delete().eq("original_path", c.path);
      } catch (e) {
        const message = e instanceof Error ? e.message : "failed";
        summary.failed.push({ path: c.path, error: message });
        await supabase.from("import_claims").update({ error: message.slice(0, 500) }).eq("original_path", c.path);
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, limit) }, worker));

  summary.remaining = Math.max(0, queue.length - next);
  summary.ms = Date.now() - started;
  return summary;
}
