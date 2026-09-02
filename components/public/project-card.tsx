import Image from "next/image";
import Link from "next/link";
import type { ProjectWithCover } from "@/lib/types";
import { photoUrl } from "@/lib/images";
import { formatMonthYear, pluralize } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function projectHref(p: { slug: string; category?: { slug: string } | null }) {
  return p.category ? `/portfolio/${p.category.slug}/${p.slug}` : `/portfolio/all/${p.slug}`;
}

export function ProjectCard({
  project,
  className,
  priority,
  aspect = "aspect-[4/3]",
}: {
  project: ProjectWithCover;
  className?: string;
  priority?: boolean;
  aspect?: string;
}) {
  const cover = project.cover;
  return (
    <Link
      href={projectHref(project)}
      className={cn("group block outline-card-soft overflow-hidden hover:border-ink transition-colors", className)}
    >
      <div
        className={cn("relative w-full overflow-hidden bg-cream-deep", aspect)}
        style={{ backgroundColor: cover?.dominant_color ?? undefined }}
      >
        {cover ? (
          <Image
            src={photoUrl(cover.web_path)}
            alt={cover.alt ?? project.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            quality={75}
            priority={priority}
            placeholder={cover.blur_data_url ? "blur" : "empty"}
            blurDataURL={cover.blur_data_url ?? undefined}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-ink-faint text-xs font-mono uppercase tracking-widest">
            No photos yet
          </div>
        )}
      </div>
      <div className="p-4 flex items-start justify-between gap-4 border-t border-line">
        <div className="min-w-0">
          <h3 className="display text-xl truncate">{project.title}</h3>
          <p className="mt-1 text-sm text-ink-soft truncate">
            {project.subtitle ?? project.category?.name ?? ""}
          </p>
        </div>
        <div className="text-right shrink-0 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint leading-5">
          <div>{pluralize(project.photo_count, "photo")}</div>
          {project.shot_on ? <div>{formatMonthYear(project.shot_on)}</div> : null}
        </div>
      </div>
    </Link>
  );
}
