import { getWeddingWork } from "@/lib/queries";
import { Hero } from "@/components/public/hero";
import { CouplesStrip } from "@/components/public/couples-strip";
import { Films } from "@/components/public/films";
import { Offer } from "@/components/public/offer";
import { CtaBand } from "@/components/public/cta-band";

export const revalidate = 600;

export default async function HomePage() {
  const { hero, strip } = await getWeddingWork();
  return (
    <>
      <Hero photos={hero} />
      <CouplesStrip items={strip} />
      <Films />
      <Offer />
      <CtaBand />
    </>
  );
}
