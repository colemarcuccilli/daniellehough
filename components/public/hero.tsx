import Image from "next/image";
import { ArrowDown } from "lucide-react";
import type { Photo } from "@/lib/types";
import { photoUrl } from "@/lib/images";
import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/public/section";
import { InquiryButton } from "@/components/public/inquiry-modal";

export function Hero({ photo, caption }: { photo: Photo | null; caption?: string | null }) {
  return (
    <section className="relative flex min-h-[88svh] items-end overflow-hidden bg-ink text-cream sm:min-h-[92svh]">
      {photo ? (
        <Image
          src={photoUrl(photo.web_path)}
          alt={photo.alt ?? ""}
          fill
          priority
          sizes="100vw"
          quality={80}
          placeholder={photo.blur_data_url ? "blur" : "empty"}
          blurDataURL={photo.blur_data_url ?? undefined}
          className="object-cover object-[center_38%]"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-ink/35" aria-hidden />
      <Container className="relative w-full pb-14 pt-40 sm:pb-20">
        <p className="eyebrow mb-5 text-cream/75 [&::before]:bg-marigold rise">
          Danielle Hough · Indiana National Guard · U.S. Air Force
        </p>
        <h1 className="display max-w-5xl text-[3.5rem] sm:text-[5.75rem] lg:text-[7.75rem] rise rise-2">
          Professional photos, <em className="serif-accent text-marigold">from Dani&rsquo;s cam.</em>
        </h1>
        <p className="mt-6 max-w-lg text-lg text-cream/80 rise rise-3">Businesses and families across Indiana.</p>
        <div className="mt-8 flex flex-wrap gap-3 rise rise-3">
          <a href="#portfolio" className={buttonStyles({ variant: "primary", size: "lg" })}>
            Past projects <ArrowDown size={16} />
          </a>
          <InquiryButton variant="cream" size="lg">Start a project</InquiryButton>
        </div>
      </Container>
      {caption ? (
        <p className="absolute bottom-5 right-5 hidden font-mono text-[10px] uppercase tracking-[0.18em] text-cream/55 sm:block">{caption}</p>
      ) : null}
    </section>
  );
}
