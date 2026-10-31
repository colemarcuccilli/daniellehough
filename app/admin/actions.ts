"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { WEB_BUCKET, slugify } from "@/lib/images";
import { randomGallerySlug } from "@/lib/gallery";
import type { InquiryStatus, Photo, Section } from "@/lib/types";

export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

const ok = <T,>(data: T): ActionResult<T> => ({ ok: true, data });
const fail = <T,>(error: string): ActionResult<T> => ({ ok: false, error });

function friendly(message: string) {
  if (message.includes("duplicate key") && message.includes("slug")) return "That URL slug is already in use. Pick another.";
  if (message.includes("row-level security")) return "You are not allowed to do that.";
  return message;
}

/** Public pages are ISR-cached; expire everything after a content change. */
function revalidateSite() {
  revalidatePath("/", "layout");
}

const str = (v: FormDataEntryValue | null) => (typeof v === "string" ? v : "");
const bool = (v: FormDataEntryValue | null) => v === "on" || v === "true" || v === "1";

/* ------------------------------------------------------------------ */
/* auth                                                                */
/* ------------------------------------------------------------------ */

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

const passwordSchema = z.object({
  password: z.string().min(10, "Use at least 10 characters.").max(200),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: "Passwords do not match.", path: ["confirm"] });

export async function changePassword(formData: FormData): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const parsed = passwordSchema.safeParse({ password: str(formData.get("password")), confirm: str(formData.get("confirm")) });
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid password.");
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    if (error) return fail(error.message);
    return ok(undefined);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed");
  }
}

/* ------------------------------------------------------------------ */
/* projects                                                            */
/* ------------------------------------------------------------------ */

const projectSchema = z.object({
  title: z.string().trim().min(1, "Give the project a title.").max(120),
  slug: z.string().trim().max(80).optional(),
  category_id: z.string().uuid().optional().or(z.literal("")),
  subtitle: z.string().trim().max(200).optional(),
  description: z.string().trim().max(6000).optional(),
  client: z.string().trim().max(120).optional(),
  location: z.string().trim().max(120).optional(),
  shot_on: z.string().trim().optional(),
  sort_order: z.coerce.number().int().min(-1000).max(100000).default(0),
  is_published: z.boolean(),
  is_featured: z.boolean(),
});

function readProject(formData: FormData) {
  return projectSchema.safeParse({
    title: str(formData.get("title")),
    slug: str(formData.get("slug")),
    category_id: str(formData.get("category_id")),
    subtitle: str(formData.get("subtitle")),
    description: str(formData.get("description")),
    client: str(formData.get("client")),
    location: str(formData.get("location")),
    shot_on: str(formData.get("shot_on")),
    sort_order: str(formData.get("sort_order")) || "0",
    is_published: bool(formData.get("is_published")),
    is_featured: bool(formData.get("is_featured")),
  });
}

function projectRow(d: z.infer<typeof projectSchema>) {
  const slug = slugify(d.slug || d.title);
  if (!slug) throw new Error("Could not build a URL slug from that title.");
  return {
    title: d.title,
    slug,
    category_id: d.category_id || null,
    subtitle: d.subtitle || null,
    description: d.description || null,
    client: d.client || null,
    location: d.location || null,
    shot_on: d.shot_on || null,
    sort_order: d.sort_order,
    is_published: d.is_published,
    is_featured: d.is_featured,
  };
}

export async function createProject(formData: FormData): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const { supabase } = await requireAdmin();
    const parsed = readProject(formData);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Check the form.");
    const { data, error } = await supabase.from("projects").insert(projectRow(parsed.data)).select("id, slug").single();
    if (error) return fail(friendly(error.message));
    revalidateSite();
    revalidatePath("/admin", "layout");
    return ok({ id: data.id as string, slug: data.slug as string });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed");
  }
}

export async function updateProject(id: string, formData: FormData): Promise<ActionResult<{ slug: string }>> {
  try {
    const { supabase } = await requireAdmin();
    const parsed = readProject(formData);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Check the form.");
    const row = projectRow(parsed.data);
    const { error } = await supabase.from("projects").update(row).eq("id", id);
    if (error) return fail(friendly(error.message));
    revalidateSite();
    revalidatePath("/admin", "layout");
    return ok({ slug: row.slug });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed");
  }
}

export async function deleteProject(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { data: photos } = await supabase.from("photos").select("web_path").eq("project_id", id);
    const paths = ((photos ?? []) as Pick<Photo, "web_path">[]).map((p) => p.web_path);
    if (paths.length) {
      const { error: rmErr } = await supabase.storage.from(WEB_BUCKET).remove(paths);
      if (rmErr) console.error("failed removing derivatives", rmErr);
    }
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) return fail(friendly(error.message));
    revalidateSite();
    revalidatePath("/admin", "layout");
    return ok(undefined);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed");
  }
}

export async function setProjectCover(projectId: string, photoId: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("projects").update({ cover_photo_id: photoId }).eq("id", projectId);
    if (error) return fail(friendly(error.message));
    revalidateSite();
    revalidatePath(`/admin/projects/${projectId}`);
    return ok(undefined);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed");
  }
}

/* ------------------------------------------------------------------ */
/* photos                                                              */
/* ------------------------------------------------------------------ */

/**
 * Applies a new order to a set of photos. `orderedIds` may be a subset (for
 * example only the photos shown under one section filter): those photos take
 * the positions the subset already occupied, in the new order, and the rest
 * of the project keeps its place. Every photo is then renumbered 1..n.
 */
export async function reorderPhotos(projectId: string, orderedIds: string[]): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { data: all, error: readErr } = await supabase
      .from("photos")
      .select("id, sort_order")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (readErr) return fail(friendly(readErr.message));
    const rows = (all ?? []) as Pick<Photo, "id" | "sort_order">[];
    const subset = new Set(orderedIds);
    let k = 0;
    const next = rows.map((r) => (subset.has(r.id) ? orderedIds[k++] : r.id));
    const changes = next
      .map((id, i) => ({ id, sort_order: i + 1 }))
      .filter((c) => rows.find((r) => r.id === c.id)?.sort_order !== c.sort_order);
    const results = await Promise.all(
      changes.map((c) => supabase.from("photos").update({ sort_order: c.sort_order }).eq("id", c.id).eq("project_id", projectId)),
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) return fail(friendly(failed.error.message));
    revalidateSite();
    revalidatePath(`/admin/projects/${projectId}`);
    return ok(undefined);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed");
  }
}

/** Orders the whole project by the time each photo was taken (EXIF), then by file name. */
export async function sortPhotosByTakenAt(projectId: string): Promise<ActionResult<{ count: number }>> {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase.from("photos").select("id, taken_at, original_path, sort_order").eq("project_id", projectId);
    if (error) return fail(friendly(error.message));
    const rows = (data ?? []) as Pick<Photo, "id" | "taken_at" | "original_path" | "sort_order">[];
    rows.sort((a, b) => {
      const ta = a.taken_at ?? "9999";
      const tb = b.taken_at ?? "9999";
      return ta.localeCompare(tb) || a.original_path.localeCompare(b.original_path, undefined, { numeric: true });
    });
    const changes = rows.map((r, i) => ({ id: r.id, sort_order: i + 1 })).filter((c, i) => rows[i].sort_order !== c.sort_order);
    const results = await Promise.all(changes.map((c) => supabase.from("photos").update({ sort_order: c.sort_order }).eq("id", c.id)));
    const failed = results.find((r) => r.error);
    if (failed?.error) return fail(friendly(failed.error.message));
    revalidateSite();
    revalidatePath(`/admin/projects/${projectId}`);
    return ok({ count: changes.length });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed");
  }
}

/** Moves photos into a section (or out of every section with `null`). */
export async function setPhotosSection(projectId: string, photoIds: string[], sectionId: string | null): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    if (photoIds.length === 0) return ok(undefined);
    if (sectionId) {
      const { data: section } = await supabase.from("sections").select("id").eq("id", sectionId).eq("project_id", projectId).maybeSingle();
      if (!section) return fail("That section is not part of this project.");
    }
    const { error } = await supabase.from("photos").update({ section_id: sectionId }).eq("project_id", projectId).in("id", photoIds);
    if (error) return fail(friendly(error.message));
    revalidateSite();
    revalidatePath(`/admin/projects/${projectId}`);
    return ok(undefined);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed");
  }
}

const photoSchema = z.object({
  alt: z.string().trim().max(300).optional(),
  caption: z.string().trim().max(1000).optional(),
  is_published: z.boolean(),
});

export async function updatePhoto(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const parsed = photoSchema.safeParse({
      alt: str(formData.get("alt")),
      caption: str(formData.get("caption")),
      is_published: bool(formData.get("is_published")),
    });
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Check the form.");
    const { error } = await supabase
      .from("photos")
      .update({ alt: parsed.data.alt || null, caption: parsed.data.caption || null, is_published: parsed.data.is_published })
      .eq("id", id);
    if (error) return fail(friendly(error.message));
    revalidateSite();
    revalidatePath("/admin", "layout");
    return ok(undefined);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed");
  }
}

export async function togglePhotoPublished(id: string, published: boolean): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("photos").update({ is_published: published }).eq("id", id);
    if (error) return fail(friendly(error.message));
    revalidateSite();
    revalidatePath("/admin", "layout");
    return ok(undefined);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed");
  }
}

export async function deletePhoto(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { data: photo } = await supabase.from("photos").select("web_path, project_id").eq("id", id).maybeSingle();
    if (!photo) return fail("Photo not found.");
    const { error } = await supabase.from("photos").delete().eq("id", id);
    if (error) return fail(friendly(error.message));
    const { error: rmErr } = await supabase.storage.from(WEB_BUCKET).remove([photo.web_path as string]);
    if (rmErr) console.error("failed removing derivative", rmErr);
    revalidateSite();
    revalidatePath(`/admin/projects/${photo.project_id}`);
    return ok(undefined);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed");
  }
}

/* ------------------------------------------------------------------ */
/* categories                                                          */
/* ------------------------------------------------------------------ */

const categorySchema = z.object({
  name: z.string().trim().min(1, "Give the category a name.").max(80),
  slug: z.string().trim().max(80).optional(),
  tagline: z.string().trim().max(200).optional(),
  description: z.string().trim().max(4000).optional(),
  sort_order: z.coerce.number().int().min(-1000).max(100000).default(0),
  is_published: z.boolean(),
  cover_project_id: z.string().uuid().optional().or(z.literal("")),
});

function readCategory(formData: FormData) {
  return categorySchema.safeParse({
    name: str(formData.get("name")),
    slug: str(formData.get("slug")),
    tagline: str(formData.get("tagline")),
    description: str(formData.get("description")),
    sort_order: str(formData.get("sort_order")) || "0",
    is_published: bool(formData.get("is_published")),
    cover_project_id: str(formData.get("cover_project_id")),
  });
}

async function coverFromProject(supabase: Awaited<ReturnType<typeof createClient>>, projectId: string | undefined) {
  if (!projectId) return null;
  const { data } = await supabase.from("projects").select("cover_photo_id").eq("id", projectId).maybeSingle();
  if (data?.cover_photo_id) return data.cover_photo_id as string;
  const { data: first } = await supabase
    .from("photos")
    .select("id")
    .eq("project_id", projectId)
    .order("sort_order")
    .limit(1)
    .maybeSingle();
  return (first?.id as string | undefined) ?? null;
}

export async function createCategory(formData: FormData): Promise<ActionResult<{ id: string }>> {
  try {
    const { supabase } = await requireAdmin();
    const parsed = readCategory(formData);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Check the form.");
    const d = parsed.data;
    const slug = slugify(d.slug || d.name);
    if (!slug) return fail("Could not build a URL slug from that name.");
    const { data, error } = await supabase
      .from("categories")
      .insert({
        name: d.name,
        slug,
        tagline: d.tagline || null,
        description: d.description || null,
        sort_order: d.sort_order,
        is_published: d.is_published,
        cover_photo_id: await coverFromProject(supabase, d.cover_project_id || undefined),
      })
      .select("id")
      .single();
    if (error) return fail(friendly(error.message));
    revalidateSite();
    revalidatePath("/admin", "layout");
    return ok({ id: data.id as string });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed");
  }
}

export async function updateCategory(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const parsed = readCategory(formData);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Check the form.");
    const d = parsed.data;
    const slug = slugify(d.slug || d.name);
    if (!slug) return fail("Could not build a URL slug from that name.");
    const update: Record<string, unknown> = {
      name: d.name,
      slug,
      tagline: d.tagline || null,
      description: d.description || null,
      sort_order: d.sort_order,
      is_published: d.is_published,
    };
    if (d.cover_project_id) update.cover_photo_id = await coverFromProject(supabase, d.cover_project_id);
    const { error } = await supabase.from("categories").update(update).eq("id", id);
    if (error) return fail(friendly(error.message));
    revalidateSite();
    revalidatePath("/admin", "layout");
    return ok(undefined);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed");
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return fail(friendly(error.message));
    revalidateSite();
    revalidatePath("/admin", "layout");
    return ok(undefined);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed");
  }
}

/* ------------------------------------------------------------------ */
/* inquiries                                                           */
/* ------------------------------------------------------------------ */

const STATUSES: InquiryStatus[] = ["new", "read", "replied", "archived"];

export async function setInquiryStatus(id: string, status: InquiryStatus): Promise<ActionResult> {
  try {
    if (!STATUSES.includes(status)) return fail("Unknown status.");
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("inquiries").update({ status }).eq("id", id);
    if (error) return fail(friendly(error.message));
    revalidatePath("/admin", "layout");
    return ok(undefined);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed");
  }
}

export async function saveInquiryNotes(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const notes = str(formData.get("admin_notes")).trim().slice(0, 5000);
    const { error } = await supabase.from("inquiries").update({ admin_notes: notes || null }).eq("id", id);
    if (error) return fail(friendly(error.message));
    revalidatePath(`/admin/inquiries/${id}`);
    return ok(undefined);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed");
  }
}

export async function deleteInquiry(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("inquiries").delete().eq("id", id);
    if (error) return fail(friendly(error.message));
    revalidatePath("/admin", "layout");
    return ok(undefined);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed");
  }
}

/** Marks an inquiry as read the first time an admin opens it. */
export async function markInquiryRead(id: string): Promise<void> {
  try {
    const { supabase } = await requireAdmin();
    await supabase.from("inquiries").update({ status: "read" }).eq("id", id).eq("status", "new");
    revalidatePath("/admin", "layout");
  } catch {
    // ignore
  }
}

/* ------------------------------------------------------------------ */
/* client galleries                                                    */
/* ------------------------------------------------------------------ */

const gallerySchema = z.object({
  gallery_enabled: z.boolean(),
  gallery_downloads: z.boolean(),
  gallery_intro: z.string().trim().max(2000).optional(),
});

/** Gallery switches + intro. Mints a share slug the first time the gallery is enabled. */
export async function updateGallery(projectId: string, formData: FormData): Promise<ActionResult<{ gallery_slug: string | null }>> {
  try {
    const { supabase } = await requireAdmin();
    const parsed = gallerySchema.safeParse({
      gallery_enabled: bool(formData.get("gallery_enabled")),
      gallery_downloads: bool(formData.get("gallery_downloads")),
      gallery_intro: str(formData.get("gallery_intro")),
    });
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Check the form.");
    const { data: current } = await supabase.from("projects").select("gallery_slug").eq("id", projectId).maybeSingle();
    if (!current) return fail("Project not found.");
    const update: Record<string, unknown> = {
      gallery_enabled: parsed.data.gallery_enabled,
      gallery_downloads: parsed.data.gallery_downloads,
      gallery_intro: parsed.data.gallery_intro || null,
    };
    let slug = (current.gallery_slug as string | null) ?? null;
    if (!slug && parsed.data.gallery_enabled) {
      slug = randomGallerySlug();
      update.gallery_slug = slug;
    }
    const { error } = await supabase.from("projects").update(update).eq("id", projectId);
    if (error) return fail(friendly(error.message));
    revalidateSite();
    revalidatePath("/admin", "layout");
    return ok({ gallery_slug: slug });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed");
  }
}

/** Replaces the share link; the old one stops working immediately. */
export async function regenerateGallerySlug(projectId: string): Promise<ActionResult<{ gallery_slug: string }>> {
  try {
    const { supabase } = await requireAdmin();
    const slug = randomGallerySlug();
    const { error } = await supabase.from("projects").update({ gallery_slug: slug }).eq("id", projectId);
    if (error) return fail(friendly(error.message));
    revalidateSite();
    revalidatePath("/admin", "layout");
    return ok({ gallery_slug: slug });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed");
  }
}

/* ------------------------------------------------------------------ */
/* sections                                                            */
/* ------------------------------------------------------------------ */

const sectionName = z.string().trim().min(1, "Give the section a name.").max(80);

async function uniqueSectionSlug(supabase: Awaited<ReturnType<typeof createClient>>, projectId: string, name: string, excludeId?: string) {
  const base = slugify(name) || "section";
  const { data } = await supabase.from("sections").select("id, slug").eq("project_id", projectId);
  const taken = new Set(((data ?? []) as Pick<Section, "id" | "slug">[]).filter((s) => s.id !== excludeId).map((s) => s.slug));
  let slug = base;
  for (let i = 2; taken.has(slug); i++) slug = `${base}-${i}`;
  return slug;
}

export async function createSection(projectId: string, name: string): Promise<ActionResult<Section>> {
  try {
    const { supabase } = await requireAdmin();
    const parsed = sectionName.safeParse(name);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Check the name.");
    const { data: last } = await supabase
      .from("sections")
      .select("sort_order")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const { data, error } = await supabase
      .from("sections")
      .insert({
        project_id: projectId,
        name: parsed.data,
        slug: await uniqueSectionSlug(supabase, projectId, parsed.data),
        sort_order: ((last?.sort_order as number | undefined) ?? 0) + 1,
      })
      .select("*")
      .single();
    if (error) return fail(friendly(error.message));
    revalidateSite();
    revalidatePath(`/admin/projects/${projectId}`);
    return ok(data as Section);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed");
  }
}

export async function renameSection(id: string, name: string): Promise<ActionResult<Section>> {
  try {
    const { supabase } = await requireAdmin();
    const parsed = sectionName.safeParse(name);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Check the name.");
    const { data: existing } = await supabase.from("sections").select("project_id").eq("id", id).maybeSingle();
    if (!existing) return fail("Section not found.");
    const projectId = existing.project_id as string;
    const { data, error } = await supabase
      .from("sections")
      .update({ name: parsed.data, slug: await uniqueSectionSlug(supabase, projectId, parsed.data, id) })
      .eq("id", id)
      .select("*")
      .single();
    if (error) return fail(friendly(error.message));
    revalidateSite();
    revalidatePath(`/admin/projects/${projectId}`);
    return ok(data as Section);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed");
  }
}

/** Deletes a section; its photos stay in the project without a section. */
export async function deleteSection(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { data: existing } = await supabase.from("sections").select("project_id").eq("id", id).maybeSingle();
    if (!existing) return fail("Section not found.");
    const { error } = await supabase.from("sections").delete().eq("id", id);
    if (error) return fail(friendly(error.message));
    revalidateSite();
    revalidatePath(`/admin/projects/${existing.project_id as string}`);
    return ok(undefined);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed");
  }
}

export async function reorderSections(projectId: string, orderedIds: string[]): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const results = await Promise.all(
      orderedIds.map((id, i) => supabase.from("sections").update({ sort_order: i + 1 }).eq("id", id).eq("project_id", projectId)),
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) return fail(friendly(failed.error.message));
    revalidateSite();
    revalidatePath(`/admin/projects/${projectId}`);
    return ok(undefined);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed");
  }
}
