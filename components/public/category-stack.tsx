import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CSSProperties } from "react";
import type { CategoryWithCover } from "@/lib/types";
import { photoUrl } from "@/lib/images";
import { cn, pluralize } from "@/lib/utils";

const ACCENTS = ["var(--color-marigold)", "var(--color-teal)", "var(--color-purple)", "var(--color-green)"];

/**
 * Stacked category bands: black-and-white cover with the category number and
 * counts top-left, arrow bottom-left, oversized title on the right. Hover
 * unfolds the band and brings the photo up in colour (styles: `.band*`).
 */
export function CategoryStack({ categories, compact, id = "portfolio" }: { categories: CategoryWithCover[]; compact?: boolean; id?: string }) {
  return (
    <section id={id} className="flex flex-col gap-1.5 px-2 sm:px-3 scroll-mt-20">
      {categories.map((c, i) => {
        const accent = ACCENTS[i % ACCENTS.length];
        const cover = c.cover;
        return (
          <Link
            key={c.id}
            href={`/portfolio/${c.slug}`}
            className={cn("band group", compact && "band-compact")}
            style={{ "--accent": accent } as CSSProperties}
            aria-label={`${c.name}: ${pluralize(c.project_count, "project")}, ${pluralize(c.photo_count, "photo")}`}
          >
            {cover ? (
              <Image
                src={photoUrl(cover.web_path)}
                alt=""
                fill
                sizes="100vw"
                quality={75}
                priority={i < 2}
                placeholder={cover.blur_data_url ? "blur" : "empty"}
                blurDataURL={cover.blur_data_url ?? undefined}
                className="band-img"
              />
            ) : null}
            <span className="band-shade" aria-hidden />
            <div className="band-content">
              <div className="band-info">
                <span className="band-num">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  {pluralize(c.project_count, "project")} · {pluralize(c.photo_count, "photo")}
                </span>
                {c.tagline ? <span className="band-tag hidden sm:block">{c.tagline}</span> : null}
              </div>
              <span className="band-arrow" aria-hidden>
                <ArrowUpRight size={20} />
              </span>
              <h2 className="band-title">{c.name}</h2>
            </div>
          </Link>
        );
      })}
    </section>
  );
}
