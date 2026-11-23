import Image from "next/image";
import Link from "next/link";
import type { Photo } from "@/lib/types";
import { photoUrl } from "@/lib/images";

/** Four equal frames, one couple each. A sample of the range, not a project page. */
export function CouplesStrip({ items }: { items: { photo: Photo; label: string; place: string }[] }) {
  if (items.length === 0) return null;
  return (
    <section id="work" className="scroll-mt-16 px-2 py-2 sm:px-3 sm:py-3">
      <ul className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        {items.map(({ photo, label, place }) => (
          <li key={photo.id}>
            <Link href="/portfolio#weddings" className="group block">
              <div className="relative aspect-[3/4] overflow-hidden bg-cream-deep" style={{ backgroundColor: photo.dominant_color ?? undefined }}>
                <Image
                  src={photoUrl(photo.web_path)}
                  alt={`${label}, ${place}`}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  quality={75}
                  placeholder={photo.blur_data_url ? "blur" : "empty"}
                  blurDataURL={photo.blur_data_url ?? undefined}
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
              </div>
              <p className="caps flex flex-wrap justify-between gap-x-3 px-1 py-3 text-[0.6rem]">
                <span>{label}</span>
                <span className="text-ink-faint">{place}</span>
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
