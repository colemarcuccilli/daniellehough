import Image from "next/image";
import Link from "next/link";
import type { Photo } from "@/lib/types";
import { photoUrl } from "@/lib/images";
import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/public/section";
import { Branch } from "@/components/public/greenery";
import { InquiryButton } from "@/components/public/inquiry-modal";

export function Hero({ photo }: { photo: Photo | null }) {
  return (
    <section className="relative flex min-h-[90svh] items-end overflow-hidden bg-sage-deep text-cream sm:min-h-[94svh]">
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
          className="object-cover object-[center_30%]"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(35,40,35,0.9)] via-[rgba(35,40,35,0.28)] to-[rgba(35,40,35,0.4)]" aria-hidden />
      <Branch className="pointer-events-none absolute -left-10 top-16 hidden h-40 w-auto rotate-[24deg] text-cream opacity-50 sm:block" />
      <Branch className="pointer-events-none absolute -right-10 top-16 hidden h-40 w-auto -scale-x-100 -rotate-[24deg] text-cream opacity-50 sm:block" />
      <Container className="relative w-full pb-12 pt-40 text-center sm:pb-16">
        <p className="eyebrow no-rule mb-5 justify-center text-cream/80 rise">Indiana wedding photographer</p>
        <h1 className="display hero-title rise rise-2">
          <span className="block whitespace-nowrap">Wedding photography,</span>
          <em className="serif-accent block whitespace-nowrap text-marigold">kept simple.</em>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-cream/85 rise rise-3">
          Weddings, engagements, and save the dates. One photographer, one clear quote.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3 rise rise-3">
          <InquiryButton kind="wedding" variant="primary" size="lg">Check your date</InquiryButton>
          <Link href="/portfolio" className={buttonStyles({ variant: "cream", size: "lg" })}>
            See the work
          </Link>
        </div>
        <p className="caps mx-auto mt-10 max-w-md text-[0.6rem] leading-5 text-cream/65 rise rise-3">
          Military-owned · Photographed by Danielle Hough, Indiana National Guard and U.S. Air Force
        </p>
      </Container>
    </section>
  );
}
