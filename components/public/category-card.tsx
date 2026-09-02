import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CategoryWithCover } from "@/lib/types";
import { photoUrl } from "@/lib/images";
import { pluralize } from "@/lib/utils";

export function CategoryCard({ category, priority }: { category: CategoryWithCover; priority?: boolean }) {
  const cover = category.cover;
  return (
    <Link
      href={`/portfolio/${category.slug}`}
      className="group relative block aspect-[4/5] sm:aspect-[3/4] overflow-hidden rounded-md border border-ink bg-slate-deep"
      style={{ backgroundColor: cover?.dominant_color ?? undefined }}
    >
      {cover ? (
        <Image
          src={photoUrl(cover.web_path)}
          alt={cover.alt ?? category.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          quality={75}
          priority={priority}
          placeholder={cover.blur_data_url ? "blur" : "empty"}
          blurDataURL={cover.blur_data_url ?? undefined}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-cream">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h3 className="display text-2xl sm:text-[1.7rem] leading-tight">{category.name}</h3>
            <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-cream/80">
              {pluralize(category.project_count, "project")} · {pluralize(category.photo_count, "photo")}
            </p>
          </div>
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cream/60 bg-ink/30 backdrop-blur transition-colors group-hover:bg-marigold group-hover:text-ink group-hover:border-marigold">
            <ArrowUpRight size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
}
