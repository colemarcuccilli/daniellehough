import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdmin } from "@/lib/admin";
import { IngestError, ingestOriginal } from "@/lib/photos/ingest";

export const runtime = "nodejs";
export const maxDuration = 180;

const bodySchema = z.object({
  projectId: z.string().uuid(),
  originalPath: z.string().min(1).max(500),
  sectionId: z.string().uuid().nullable().optional(),
});

/**
 * Turns an original that already sits in the private originals bucket into a
 * web derivative + a `photos` row. The browser uploads the original directly
 * to Supabase first (no Vercel body limits), then calls this.
 */
export async function POST(request: Request) {
  const ctx = await getAdmin();
  if (!ctx) return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  const { supabase } = ctx;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const { projectId, originalPath } = parsed.data;
  let sectionId: string | null = parsed.data.sectionId ?? null;

  const { data: project } = await supabase.from("projects").select("id, slug, cover_photo_id").eq("id", projectId).maybeSingle();
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  if (sectionId) {
    const { data: section } = await supabase.from("sections").select("id").eq("id", sectionId).eq("project_id", projectId).maybeSingle();
    if (!section) sectionId = null;
  }

  try {
    const { photo, existed } = await ingestOriginal(supabase, {
      projectId,
      projectSlug: project.slug as string,
      coverPhotoId: (project.cover_photo_id as string | null) ?? null,
      originalPath,
      sectionId,
    });
    if (!existed) {
      revalidatePath("/", "layout");
      revalidatePath(`/admin/projects/${projectId}`);
    }
    return NextResponse.json({ photo, existed });
  } catch (e) {
    const status = e instanceof IngestError ? e.status : 500;
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status });
  }
}
