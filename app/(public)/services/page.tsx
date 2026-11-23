import type { Metadata } from "next";
import { getSiteImages } from "@/lib/queries";
import { Container } from "@/components/public/section";
import { PageHeader } from "@/components/public/page-header";
import { ServiceCard } from "@/components/public/service-card";
import { Films } from "@/components/public/films";
import { Offer } from "@/components/public/offer";
import { CtaBand } from "@/components/public/cta-band";
import { InquiryButton } from "@/components/public/inquiry-modal";
import { FAMILY_SESSIONS, FAQ, SERVICES } from "@/lib/content";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Wedding photography, films, and packages",
  description:
    "Wedding, engagement, and save-the-date photography in Indiana and at destination weddings. Films with Sweet Dreams, social recaps, and wedding websites with RSVP and evites.",
};

export default async function ServicesPage() {
  const images = await getSiteImages();
  return (
    <>
      <PageHeader eyebrow="Services" title="Packages" body="Weddings, engagements, save the dates. Social media recap and wedding website included.">
        <InquiryButton kind="wedding" variant="primary" size="lg">Check your date</InquiryButton>
      </PageHeader>

      <Container className="py-14 sm:py-20">
        <div className="grid gap-14 md:grid-cols-3 md:gap-8">
          {SERVICES.map((s, i) => (
            <ServiceCard key={s.slug} service={s} photo={images[s.slug]} priority={i === 0} />
          ))}
        </div>
      </Container>

      <Films />
      <Offer />

      <Container className="py-16 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <h2 className="display text-6xl sm:text-7xl">Questions</h2>
          <dl className="border-t border-line">
            {FAQ.map((f) => (
              <div key={f.q} className="border-b border-line py-5">
                <dt className="display text-3xl">{f.q}</dt>
                <dd className="mt-1.5 leading-relaxed text-ink-soft">{f.a}</dd>
              </div>
            ))}
            <div id="families" className="flex scroll-mt-24 flex-wrap items-center justify-between gap-4 border-b border-line py-5">
              <div>
                <dt className="display text-3xl">{FAMILY_SESSIONS.name}</dt>
                <dd className="mt-1.5 text-ink-soft">{FAMILY_SESSIONS.summary}</dd>
              </div>
              <InquiryButton kind={FAMILY_SESSIONS.kind} variant="outline" size="md">Book a session</InquiryButton>
            </div>
          </dl>
        </div>
      </Container>

      <CtaBand />
    </>
  );
}
