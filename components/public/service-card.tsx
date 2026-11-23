import Image from "next/image";
import { Check } from "lucide-react";
import type { Photo } from "@/lib/types";
import type { Service } from "@/lib/content";
import { photoUrl } from "@/lib/images";
import { InquiryButton } from "@/components/public/inquiry-modal";

/** Arched photo over a short, plain description. Used on the home and services pages. */
export function ServiceCard({ service, photo, priority }: { service: Service; photo: Photo | null; priority?: boolean }) {
  return (
    <article id={service.slug} className="flex scroll-mt-24 flex-col text-center">
      <div className="arch-ring mx-auto w-full max-w-[19rem]">
        <div className="arch relative aspect-[3/4] bg-sage-soft" style={{ backgroundColor: photo?.dominant_color ?? undefined }}>
          {photo ? (
            <Image
              src={photoUrl(photo.web_path)}
              alt={photo.alt ?? service.name}
              fill
              priority={priority}
              sizes="(max-width: 768px) 80vw, 304px"
              quality={75}
              placeholder={photo.blur_data_url ? "blur" : "empty"}
              blurDataURL={photo.blur_data_url ?? undefined}
              className="object-cover"
            />
          ) : null}
        </div>
      </div>
      <h3 className="display mt-7 text-4xl sm:text-[2.6rem]">{service.name}</h3>
      <p className="mx-auto mt-2 max-w-xs text-ink-soft leading-relaxed">{service.summary}</p>
      <ul className="mx-auto mt-5 grid max-w-xs gap-2 text-left text-sm">
        {service.includes.map((line) => (
          <li key={line} className="flex gap-2.5">
            <Check size={15} className="mt-0.5 shrink-0 text-green" />
            {line}
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-7">
        <InquiryButton kind={service.kind} variant="outline" size="md">{service.ask}</InquiryButton>
      </div>
    </article>
  );
}
