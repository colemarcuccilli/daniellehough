import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { photoUrl } from "@/lib/images";
import { buttonStyles } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Photo, Project } from "@/lib/types";
import { formatMonthYear, relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Row = Project & {
  category: { id: string; name: string; slug: string } | null;
  cover: Pick<Photo, "web_path" | "blur_data_url" | "dominant_color"> | null;
  photo_count: { count: number }[];
};

export default async function AdminProjectsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("projects")
    .select(
      "*, category:categories!projects_category_id_fkey(id, name, slug), cover:photos!projects_cover_photo_fk(web_path, blur_data_url, dominant_color), photo_count:photos!photos_project_id_fkey(count)",
    )
    .order("updated_at", { ascending: false });
  const rows = (data ?? []) as Row[];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">{rows.length} total</p>
          <h1 className="display text-4xl">Projects</h1>
        </div>
        <Link href="/admin/projects/new" className={buttonStyles({ variant: "primary" })}>
          <Plus size={16} /> New project
        </Link>
      </header>

      {rows.length === 0 ? (
        <p className="outline-card-soft p-10 text-center text-ink-soft">No projects yet. Create one, then upload or import photos.</p>
      ) : (
        <ul className="outline-card divide-y divide-line overflow-hidden">
          {rows.map((p) => (
            <li key={p.id}>
              <Link href={`/admin/projects/${p.id}`} className="flex items-center gap-4 px-3 py-3 sm:px-4 hover:bg-cream transition-colors">
                <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xs bg-cream-deep border border-line" style={{ backgroundColor: p.cover?.dominant_color ?? undefined }}>
                  {p.cover ? (
                    <Image src={photoUrl(p.cover.web_path)} alt="" fill sizes="80px" quality={70} className="object-cover" placeholder={p.cover.blur_data_url ? "blur" : "empty"} blurDataURL={p.cover.blur_data_url ?? undefined} />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{p.title}</p>
                  <p className="text-xs text-ink-soft truncate">
                    {p.category?.name ?? "No category"} · {p.photo_count?.[0]?.count ?? 0} photos
                    {p.shot_on ? ` · ${formatMonthYear(p.shot_on)}` : ""}
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  {p.is_featured ? <Badge tone="marigold">Featured</Badge> : null}
                  <Badge tone={p.is_published ? "moss" : "outline"}>{p.is_published ? "Published" : "Draft"}</Badge>
                </div>
                <span className="text-xs text-ink-faint whitespace-nowrap hidden md:inline">{relativeTime(p.updated_at)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
