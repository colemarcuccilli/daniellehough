import Image from "next/image";
import Link from "next/link";
import type { WeddingProject } from "@/lib/queries";
import { photoUrl } from "@/lib/images";

/** A small row of four frames, one project each, linking to the portfolio. Deliberately compact: the home page is not a gallery. */
export function CouplesStrip({ projects }: { projects: WeddingProject[] }) {
  const items = projects.filter((p) => p.thumb);
  if (items.length === 0) return null;
  return (
    <section id="work" className="scroll-mt-16 py-8 sm:py-10">
      <ul className="mx-auto grid max-w-3xl grid-cols-4 gap-2 px-5 sm:gap-4 sm:px-8">
        {items.map((p) => (
          <li key={p.slug}>
            <Link href={`/portfolio/weddings/${p.slug}`} className="group block">
              <div className="relative aspect-[4/5] overflow-hidden bg-cream-deep" style={{ backgroundColor: p.thumb!.dominant_color ?? undefined }}>
                <Image
                  src={photoUrl(p.thumb!.web_path)}
                  alt={p.title}
                  fill
                  sizes="(max-width: 768px) 25vw, 180px"
                  quality={75}
                  placeholder={p.thumb!.blur_data_url ? "blur" : "empty"}
                  blurDataURL={p.thumb!.blur_data_url ?? undefined}
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
              </div>
              <p className="caps mt-2 text-[0.52rem] leading-4 sm:text-[0.58rem]">{p.kind}</p>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-5 text-center">
        <Link href="/portfolio" className="caps border-b border-sage pb-1 text-[0.62rem] hover:border-marigold-deep hover:text-marigold-deep">
          Portfolio
        </Link>
      </p>
    </section>
  );
}
