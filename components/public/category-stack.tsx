import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CSSProperties } from "react";
import type { CategoryWithCover } from "@/lib/types";
import { photoUrl } from "@/lib/images";
import { cn, pluralize } from "@/lib/utils";

const ACCENTS = ["marigold", "teal", "purple", "green"] as const;

/**
 * Full-width stacked category covers: one band per category, cover photo
 * behind the title, accent colour rotating through the palette.
 */
export function CategoryStack({
  categories,
  compact,
  id = "portfolio",
}: {
  categories: CategoryWithCover[];
  compact?: boolean;
  id?: string;
}) {
  return (
    <section id={id} className="flex flex-col gap-1 px-1 sm:px-2 scroll-mt-16">
      {categories.map((c, i) => {
        const accent = ACCENTS[i % ACCENTS.length];
        const cover = c.cover;
        return (
          <Link
            key={c.id}
            href={`/portfolio/${c.slug}`}
            className={cn(
              "group relative block w-full overflow-hidden rounded-sm bg-cream-deep",
              compact ? "h-[48vh] min-h-[300px] max-h-[520px]" : "h-[62vh] min-h-[360px] max-h-[720px]",
            )}
            style={{ backgroundColor: cover?.dominant_color ?? undefined, "--accent": `var(--color-${accent})` } as CSSProperties}
          >
            {cover ? (
              <Image
                src={photoUrl(cover.web_path)}
                alt={cover.alt ?? c.name}
                fill
                sizes="100vw"
                quality={75}
                priority={i < 2}
                placeholder={cover.blur_data_url ? "blur" : "empty"}
                blurDataURL={cover.blur_data_url ?? undefined}
                className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.03]"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/15 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-8 lg:p-10 text-cream">
              <div className="min-w-0">
                <span className="mb-4 block h-1 w-12 rounded-full" style={{ background: "var(--accent)" }} aria-hidden />
                <h2 className="display text-4xl sm:text-6xl lg:text-7xl leading-none">{c.name}</h2>
                <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.16em] text-cream/80">
                  <span>{pluralize(c.project_count, "project")}</span>
                  <span aria-hidden>·</span>
                  <span>{pluralize(c.photo_count, "photo")}</span>
                  {c.tagline ? (
                    <>
                      <span aria-hidden className="hidden sm:inline">·</span>
                      <span className="hidden sm:inline normal-case tracking-normal font-sans text-sm text-cream/85">{c.tagline}</span>
                    </>
                  ) : null}
                </p>
              </div>
              <span
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cream/60 bg-ink/30 backdrop-blur transition-colors group-hover:text-ink"
                style={{ ["--hover" as string]: "var(--accent)" }}
              >
                <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                <span className="absolute inset-0 -z-10 rounded-full opacity-0 transition-opacity group-hover:opacity-100" style={{ background: "var(--accent)" }} aria-hidden />
              </span>
            </div>
          </Link>
        );
      })}
    </section>
  );
}
