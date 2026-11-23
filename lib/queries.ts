import { createPublicClient } from "@/lib/supabase/public";
import type { Category, CategoryWithCover, Photo, Project, ProjectWithCover, Section } from "@/lib/types";
import { CARD_PHOTOS, CATEGORY_ORDER, FEATURED_PHOTOS, HERO_SLIDES, WEDDING_PROJECTS } from "@/lib/content";

/* eslint-disable @typescript-eslint/no-explicit-any */

const PROJECT_SELECT =
  "*, cover:photos!projects_cover_photo_fk(*), category:categories!projects_category_id_fkey(id, slug, name), photo_count:photos!photos_project_id_fkey(count)";

function shapeProject(row: any): ProjectWithCover {
  const { cover, category, photo_count, ...project } = row;
  return {
    ...(project as Project),
    cover: (cover as Photo | null) ?? null,
    category: (category as ProjectWithCover["category"]) ?? null,
    photo_count: Array.isArray(photo_count) ? (photo_count[0]?.count ?? 0) : 0,
  };
}

/** Fill in a first-photo fallback for projects that have no explicit cover. */
async function withFallbackCovers(projects: ProjectWithCover[]): Promise<ProjectWithCover[]> {
  const missing = projects.filter((p) => !p.cover && p.photo_count > 0).map((p) => p.id);
  if (missing.length === 0) return projects;
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("photos")
    .select("*")
    .in("project_id", missing)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  const first = new Map<string, Photo>();
  for (const ph of (data ?? []) as Photo[]) if (!first.has(ph.project_id)) first.set(ph.project_id, ph);
  return projects.map((p) => (p.cover ? p : { ...p, cover: first.get(p.id) ?? null }));
}

export async function getProjects(opts: { featuredOnly?: boolean; categoryId?: string } = {}): Promise<ProjectWithCover[]> {
  const supabase = createPublicClient();
  let q = supabase.from("projects").select(PROJECT_SELECT).eq("is_published", true);
  if (opts.featuredOnly) q = q.eq("is_featured", true);
  if (opts.categoryId) q = q.eq("category_id", opts.categoryId);
  const { data, error } = await q.order("sort_order", { ascending: true }).order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return withFallbackCovers((data ?? []).map(shapeProject));
}

export async function getCategories(): Promise<Category[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  // Wedding and couples work leads; the rest keeps its admin order behind it.
  const rank = (c: Category) => {
    const i = CATEGORY_ORDER.indexOf(c.slug);
    return i === -1 ? CATEGORY_ORDER.length : i;
  };
  return ((data ?? []) as Category[]).sort((a, b) => rank(a) - rank(b));
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = createPublicClient();
  const { data } = await supabase.from("categories").select("*").eq("slug", slug).eq("is_published", true).maybeSingle();
  return (data as Category | null) ?? null;
}

/** Categories + all published projects, with per-category counts and covers resolved. */
export async function getPortfolioIndex(): Promise<{ categories: CategoryWithCover[]; projects: ProjectWithCover[] }> {
  const [categories, projects] = await Promise.all([getCategories(), getProjects()]);
  const supabase = createPublicClient();
  const coverIds = categories.map((c) => c.cover_photo_id).filter(Boolean) as string[];
  const { data: coverRows } = coverIds.length
    ? await supabase.from("photos").select("*").in("id", coverIds)
    : { data: [] as Photo[] };
  const covers = new Map((coverRows ?? []).map((p: Photo) => [p.id, p]));

  const shaped: CategoryWithCover[] = categories.map((c) => {
    const inCat = projects.filter((p) => p.category_id === c.id);
    const cover = (c.cover_photo_id && covers.get(c.cover_photo_id)) || inCat.find((p) => p.cover)?.cover || null;
    return {
      ...c,
      cover,
      project_count: inCat.length,
      photo_count: inCat.reduce((n, p) => n + p.photo_count, 0),
    };
  });
  return { categories: shaped, projects };
}

export type ProjectDetail = ProjectWithCover & { photos: Photo[] };

export async function getProjectBySlug(slug: string): Promise<ProjectDetail | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const project = shapeProject(data);
  const { data: photos } = await supabase
    .from("photos")
    .select("*")
    .eq("project_id", project.id)
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  const list = (photos ?? []) as Photo[];
  return { ...project, cover: project.cover ?? list[0] ?? null, photos: list };
}

export type CategoryPhoto = Photo & { project: Pick<Project, "id" | "slug" | "title" | "sort_order" | "created_at"> };

/** Every published photo in a category, ordered by project order then photo order. */
export async function getPhotosInCategory(categoryId: string): Promise<CategoryPhoto[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("photos")
    .select("*, project:projects!photos_project_id_fkey!inner(id, slug, title, sort_order, created_at, category_id, is_published)")
    .eq("project.category_id", categoryId)
    .eq("project.is_published", true)
    .eq("is_published", true);
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as CategoryPhoto[];
  return rows.sort(
    (a, b) =>
      a.project.sort_order - b.project.sort_order ||
      b.project.created_at.localeCompare(a.project.created_at) ||
      a.sort_order - b.sort_order ||
      a.created_at.localeCompare(b.created_at),
  );
}

/** Neighbouring published projects inside the same category (for prev/next links). */
export async function getProjectNeighbours(project: Project): Promise<{ prev: Project | null; next: Project | null }> {
  if (!project.category_id) return { prev: null, next: null };
  const list = await getProjects({ categoryId: project.category_id });
  const i = list.findIndex((p) => p.id === project.id);
  return { prev: i > 0 ? list[i - 1] : null, next: i >= 0 && i < list.length - 1 ? list[i + 1] : null };
}

/** Hero photograph for the home masthead: first candidate that exists, else the newest photo. */
const HERO_CANDIDATES = ["GrissomAirShow2026/260828-VB772-1751.jpg", "AirForceTucson/260215-Z-VB772-1048.jpg"];

export async function getHeroPhoto(): Promise<Photo | null> {
  const supabase = createPublicClient();
  const { data } = await supabase.from("photos").select("*").in("original_path", HERO_CANDIDATES).eq("is_published", true);
  const list = (data ?? []) as Photo[];
  for (const path of HERO_CANDIDATES) {
    const hit = list.find((p) => p.original_path === path);
    if (hit) return hit;
  }
  const { data: fallback } = await supabase
    .from("photos")
    .select("*, project:projects!photos_project_id_fkey!inner(is_published)")
    .eq("is_published", true)
    .eq("project.is_published", true)
    .order("created_at", { ascending: false })
    .limit(1);
  const hit = (fallback ?? [])[0] as (Photo & { project: unknown }) | undefined;
  if (!hit) return null;
  const { project: _p, ...photo } = hit;
  void _p;
  return photo as Photo;
}

/* ------------------------------------------------------------------ */
/* client galleries                                                    */
/* ------------------------------------------------------------------ */

export type GallerySection = Section & { photos: Photo[] };
export type Gallery = Project & { cover: Photo | null; sections: GallerySection[]; photos: Photo[] };

/**
 * An unlisted client gallery by its share slug. Photos are grouped by section
 * in section order; photos without a section land in a trailing "More" group
 * (or form the only group when the project has no sections).
 */
export async function getGalleryBySlug(slug: string): Promise<Gallery | null> {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return null;
  const supabase = createPublicClient();
  const { data: project, error } = await supabase
    .from("projects")
    .select("*, cover:photos!projects_cover_photo_fk(*)")
    .eq("gallery_slug", slug)
    .eq("gallery_enabled", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!project) return null;
  const { cover, ...row } = project as Project & { cover: Photo | null };

  const [{ data: sections }, { data: photos }] = await Promise.all([
    supabase.from("sections").select("*").eq("project_id", row.id).order("sort_order").order("created_at"),
    supabase
      .from("photos")
      .select("*")
      .eq("project_id", row.id)
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);
  const list = (photos ?? []) as Photo[];
  const groups: GallerySection[] = ((sections ?? []) as Section[]).map((s) => ({ ...s, photos: list.filter((p) => p.section_id === s.id) }));
  // The cover photo lives in the masthead; it only joins the grid when it is in a section.
  const loose = list.filter((p) => (!p.section_id || !groups.some((g) => g.id === p.section_id)) && p.id !== row.cover_photo_id);
  if (loose.length) {
    groups.push({
      id: "unsorted",
      project_id: row.id,
      slug: "more",
      name: groups.length ? "More" : "Photographs",
      sort_order: 9999,
      created_at: row.created_at,
      updated_at: row.updated_at,
      photos: loose,
    });
  }
  return { ...row, cover: cover ?? list[0] ?? null, sections: groups.filter((g) => g.photos.length > 0), photos: list };
}


const SITE_IMAGE_FALLBACKS = {
  weddings: "lakeside-proposal/dsc-9849-301.jpg",
  engagements: "lakeside-proposal/dsc-9457-294.jpg",
  "save-the-dates": "lakeside-proposal/dsc-9726-300.jpg",
} as const;

export type SiteImages = Record<keyof typeof SITE_IMAGE_FALLBACKS, Photo | null>;
export type WeddingWork = {
  /** Header rotation, one photo per shoot. */
  hero: Photo[];
  /** Curated mix across shoots, then samples from galleries without picks. */
  photos: Photo[];
  images: SiteImages;
};

const spread = <T,>(list: T[], n: number): T[] =>
  list.length <= n ? list : Array.from({ length: n }, (_, i) => list[Math.floor((i * list.length) / n)]);

/**
 * Wedding, engagement and save-the-date photos for the public pages. Sources
 * are the client galleries the owner cleared for public use. Picks in
 * `lib/content.ts` lead, interleaved across shoots; any other gallery project
 * with wedding / engagement / proposal / save-the-date in its slug is sampled
 * evenly and woven in, so a new shoot shows up without a code change.
 */
export async function getWeddingWork(): Promise<WeddingWork> {
  const supabase = createPublicClient();
  const cardPaths = Object.values(CARD_PHOTOS) as string[];
  const fallbackPaths = Object.values(SITE_IMAGE_FALLBACKS) as string[];
  const named = [...HERO_SLIDES, ...FEATURED_PHOTOS, ...cardPaths, ...fallbackPaths];
  const [{ data: rows }, { data: projs }] = await Promise.all([
    supabase.from("photos").select("*").in("web_path", named).eq("is_published", true),
    supabase
      .from("projects")
      .select("id, slug")
      .or("slug.ilike.*wedding*,slug.ilike.*engagement*,slug.ilike.*proposal*,slug.ilike.*save-the-date*")
      .order("created_at", { ascending: false }),
  ]);
  const byPath = new Map(((rows ?? []) as Photo[]).map((p) => [p.web_path, p]));
  const pick = (paths: readonly string[]) => paths.map((p) => byPath.get(p)).filter(Boolean) as Photo[];

  const images = Object.fromEntries(
    (Object.keys(SITE_IMAGE_FALLBACKS) as (keyof typeof SITE_IMAGE_FALLBACKS)[]).map((k) => [
      k,
      byPath.get(CARD_PHOTOS[k]) ?? byPath.get(SITE_IMAGE_FALLBACKS[k]) ?? null,
    ]),
  ) as SiteImages;

  // Galleries with no curated picks yet: take an even sample of each.
  const curatedFolders = new Set(named.map((p) => p.split("/")[0]));
  const fresh = ((projs ?? []) as { id: string; slug: string }[]).filter((p) => !curatedFolders.has(p.slug));
  const samples = await Promise.all(
    fresh.map(async (p) => {
      const { data } = await supabase
        .from("photos")
        .select("*")
        .eq("project_id", p.id)
        .eq("is_published", true)
        .order("sort_order", { ascending: true })
        .limit(300);
      return spread((data ?? []) as Photo[], 8);
    }),
  );

  // Weave the samples into the curated list, one every third tile.
  const photos = pick(FEATURED_PHOTOS);
  const extra = samples.flat();
  for (let i = 0; i < extra.length; i++) photos.splice(Math.min(photos.length, 1 + i * 3), 0, extra[i]);

  const hero = pick(HERO_SLIDES);
  const newestWide = samples.map((s) => s.find((p) => p.width > p.height)).filter(Boolean) as Photo[];
  return { hero: [...hero, ...newestWide].slice(0, 5), photos, images };
}

export async function getSiteImages(): Promise<SiteImages> {
  return (await getWeddingWork()).images;
}

export type WeddingProject = {
  slug: string;
  /** The project's gallery page. */
  href: string;
  title: string;
  kind: string;
  place: string;
  cover: Photo | null;
  thumb: Photo | null;
  photo_count: number;
};

/** The wedding, engagement and save-the-date projects, with covers and counts, in the configured order. */
export async function getWeddingProjects(): Promise<WeddingProject[]> {
  const supabase = createPublicClient();
  const paths = WEDDING_PROJECTS.flatMap((w) => [w.cover, w.thumb]);
  const [{ data: rows }, { data: projs }] = await Promise.all([
    supabase.from("photos").select("*").in("web_path", paths).eq("is_published", true),
    supabase
      .from("projects")
      .select("slug, gallery_slug, gallery_enabled, photo_count:photos!photos_project_id_fkey(count)")
      .in("slug", WEDDING_PROJECTS.map((w) => w.project)),
  ]);
  const byPath = new Map(((rows ?? []) as Photo[]).map((p) => [p.web_path, p]));
  const live = ((projs ?? []) as any[]).filter((p) => p.gallery_enabled && p.gallery_slug);
  const counts = new Map(live.map((p) => [p.slug, p.photo_count?.[0]?.count ?? 0]));
  const links = new Map(live.map((p) => [p.slug, `/gallery/${p.gallery_slug}`]));
  return WEDDING_PROJECTS.filter((w) => counts.has(w.project)).map((w) => ({
    slug: w.slug,
    href: links.get(w.project) as string,
    title: w.title,
    kind: w.kind,
    place: w.place,
    cover: byPath.get(w.cover) ?? null,
    thumb: byPath.get(w.thumb) ?? null,
    photo_count: counts.get(w.project) ?? 0,
  }));
}
