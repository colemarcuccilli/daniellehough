import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CSSProperties } from "react";
import type { CategoryWithCover } from "@/lib/types";
import { photoUrl } from "@/lib/images";
import { cn, pluralize } from "@/lib/utils";

const ACCENTS = ["var(--color-marigold)", "var(--color-teal)", "var(--color-purple)", "var(--color-green)"];

/**
 * Stacked category "tabs": short bands with an oversized title, each washed in
 * its accent colour. Hovering unfolds the band, lifts the wash off the photo
 * and inverts the title onto a solid accent tab. Styles live in globals.css
 * (`.band*`).
 */
export function CategoryStack({ categories, compact, id = "portfolio" }: { categories: CategoryWithCover[]; compact?: boolean; id?: string }) {
  return (
    <section id={id} className="flex flex-col gap-1.5 px-2 sm:px-3 scroll-mt-24">
      {categories.map((c, i) => {
        const accent = ACCENTS[i % ACCENTS.length];
        const cover = c.cover;
        return (
          <Link
            key={c.id}
            href={`/portfolio/${c.slug}`}
            className={cn("band group", compact && "band-compact")}
            style={{ "--accent": accent, backgroundColor: cover?.dominant_color ?? undefined } as CSSProperties}
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
            <span className="band-wash" aria-hidden />
            <span className="band-shade" aria-hidden />
            <div className="band-content">
              <h2 className="band-title">
                <span className="band-tab">{c.name}</span>
              </h2>
              <p className="band-meta">
                <span>{pluralize(c.project_count, "project")}</span>
                <span aria-hidden>·</span>
                <span>{pluralize(c.photo_count, "photo")}</span>
                {c.tagline ? <span className="hidden sm:inline normal-case tracking-normal font-sans text-sm">{c.tagline}</span> : null}
              </p>
            </div>
            <span className="band-arrow" aria-hidden>
              <ArrowUpRight size={20} />
            </span>
          </Link>
        );
      })}
    </section>
  );
}
