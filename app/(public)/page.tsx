import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getWeddingWork } from "@/lib/queries";
import { Container } from "@/components/public/section";
import { Hero } from "@/components/public/hero";
import { Films } from "@/components/public/films";
import { Offer } from "@/components/public/offer";
import { PhotoGrid } from "@/components/public/photo-grid";
import { CtaBand } from "@/components/public/cta-band";

export const revalidate = 600;

export default async function HomePage() {
  const { hero, photos } = await getWeddingWork();

  return (
    <>
      <Hero photos={hero} />

      <section id="work" className="scroll-mt-16 py-16 sm:py-24">
        <Container className="mb-8 sm:mb-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="display text-6xl sm:text-7xl lg:text-8xl">Weddings and engagements</h2>
            <Link
              href="/portfolio"
              className="caps group inline-flex items-center gap-2 border-b border-sage pb-1 text-[0.64rem] transition-colors hover:border-marigold-deep hover:text-marigold-deep"
            >
              Portfolio <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Container>
        <div className="px-1 sm:px-2">
          <PhotoGrid photos={photos.slice(0, 16)} priorityCount={2} />
        </div>
      </section>

      <Films />
      <Offer />
      <CtaBand />
    </>
  );
}
