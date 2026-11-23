import type { Photo } from "@/lib/types";
import { HeroSlides } from "@/components/public/hero-slides";
import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/public/section";
import { InquiryButton } from "@/components/public/inquiry-modal";

export function Hero({ photos }: { photos: Photo[] }) {
  return (
    <section className="relative flex min-h-[92svh] items-end overflow-hidden bg-sage-deep text-cream sm:min-h-[100svh]">
      <HeroSlides photos={photos} />
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(20,22,20,0.82)] via-[rgba(20,22,20,0.08)] to-[rgba(20,22,20,0.38)]" aria-hidden />
      <Container className="relative w-full pb-10 pt-40 sm:pb-14">
        <h1 className="display hero-title rise">
          <span className="block whitespace-nowrap">Wedding</span>
          <span className="block whitespace-nowrap">photography</span>
        </h1>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-x-10 gap-y-6 rise rise-2">
          <div className="flex flex-wrap gap-3">
            <InquiryButton kind="wedding" variant="primary" size="lg">Check your date</InquiryButton>
            <a href="#films" className={buttonStyles({ variant: "cream", size: "lg" })}>
              Films
            </a>
          </div>
          <dl className="caps grid gap-1.5 text-[0.62rem] leading-5 text-cream/80 sm:text-right">
            <div>Photo · Film · Wedding websites</div>
            <div>Indiana · Destination</div>
            <div className="text-cream/60">Danielle Hough · Indiana National Guard · U.S. Air Force</div>
          </dl>
        </div>
      </Container>
    </section>
  );
}
