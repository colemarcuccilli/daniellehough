import { createPublicClient } from "@/lib/supabase/public";
import type { Category, CategoryWithCover, Photo, Project, ProjectWithCover } from "@/lib/types";

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
  return (data ?? []) as Category[];
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
  const { data: fallback } = await supabase.from("photos").select("*").eq("is_published", true).order("created_at", { ascending: false }).limit(1);
  return ((fallback ?? [])[0] as Photo | undefined) ?? null;
}
