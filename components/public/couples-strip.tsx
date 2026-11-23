import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { WeddingProject } from "@/lib/queries";
import { photoUrl } from "@/lib/images";

const TILES = [
  { kind: "Wedding", label: "Weddings", href: "/portfolio#weddings" },
  { kind: "Engagement", label: "Engagements", href: "/portfolio#engagements" },
  { kind: "Save the date", label: "Save the dates", href: "/portfolio#engagements" },
];

/** Three small tiles, one per kind of shoot: a dimmed photo with a card over it, linking to that group on the portfolio. */
export function CouplesStrip({ projects }: { projects: WeddingProject[] }) {
  const tiles = TILES.flatMap((t) => {
    const photo = projects.find((p) => p.kind === t.kind && p.thumb)?.thumb;
    return photo ? [{ ...t, photo }] : [];
  });
  if (tiles.length === 0) return null;
  return (
    <section id="work" className="scroll-mt-16 py-8 sm:py-10">
      <ul className="mx-auto grid max-w-4xl gap-3 px-5 sm:grid-cols-3 sm:gap-4 sm:px-8">
        {tiles.map((t) => (
          <li key={t.label}>
            <Link href={t.href} className="group relative block aspect-[16/9] overflow-hidden rounded-xs bg-cream-deep sm:aspect-[4/3]">
              <Image
                src={photoUrl(t.photo.web_path)}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, 280px"
                quality={70}
                placeholder={t.photo.blur_data_url ? "blur" : "empty"}
                blurDataURL={t.photo.blur_data_url ?? undefined}
                className="object-cover object-[center_30%] opacity-45 transition-opacity duration-500 group-hover:opacity-70"
              />
              <span className="absolute inset-x-4 top-1/2 flex -translate-y-1/2 items-center justify-between gap-3 rounded-xs border border-line-strong bg-paper px-4 py-3 transition-colors group-hover:border-sage sm:inset-x-5">
                <span>
                  <span className="display block text-2xl leading-none sm:text-[1.7rem]">{t.label}</span>
                  <span className="caps mt-1.5 block text-[0.52rem] text-ink-faint">Projects</span>
                </span>
                <ArrowRight size={16} className="shrink-0 text-sage transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
