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
      className={cn("group block outline-card-soft overflow-hidden transition-colors hover:border-sage", className)}
    >
      <div className={cn("relative w-full overflow-hidden bg-cream-deep", aspect)} style={{ backgroundColor: cover?.dominant_color ?? undefined }}>
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
          <div className="caps absolute inset-0 grid place-items-center text-[0.6rem] text-ink-faint">No photos yet</div>
        )}
      </div>
      <div className="flex items-start justify-between gap-4 border-t border-line p-4">
        <div className="min-w-0">
          <h3 className="display truncate text-2xl leading-tight">{project.title}</h3>
          <p className="mt-1 truncate text-sm text-ink-soft">{project.subtitle ?? project.category?.name ?? ""}</p>
        </div>
        <div className="caps shrink-0 text-right text-[0.58rem] leading-5 text-ink-faint">
          <div>{pluralize(project.photo_count, "photo")}</div>
          {project.shot_on ? <div>{formatMonthYear(project.shot_on)}</div> : null}
        </div>
      </div>
    </Link>
  );
}
