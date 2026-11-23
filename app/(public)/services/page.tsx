import type { Metadata } from "next";
import { Check } from "lucide-react";
import { getSiteImages } from "@/lib/queries";
import { Container } from "@/components/public/section";
import { PageHeader } from "@/components/public/page-header";
import { ServiceCard } from "@/components/public/service-card";
import { PackageBuilder } from "@/components/public/package-builder";
import { ProcessSteps } from "@/components/public/process-steps";
import { PlannerBand } from "@/components/public/planner-band";
import { CtaBand } from "@/components/public/cta-band";
import { Garland } from "@/components/public/greenery";
import { InquiryButton } from "@/components/public/inquiry-modal";
import { COMBINATIONS, FAMILY_SESSIONS, FAQ, SERVICES } from "@/lib/content";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Wedding photography services and packages",
  description:
    "Wedding, engagement, and save-the-date photography in Indiana. Add a partner video team or a wedding website with RSVP and evites, priced together in one quote.",
};

export default async function ServicesPage() {
  const images = await getSiteImages();
  return (
    <>
      <PageHeader
        eyebrow="Services and packages"
        title={
          <>
            Photos first. <em className="serif-accent text-marigold">Add the rest.</em>
          </>
        }
        body="Weddings, engagements, and save the dates. Add video or a wedding website, and get one quote for all of it."
      >
        <InquiryButton kind="wedding" variant="primary" size="lg">Check your date</InquiryButton>
      </PageHeader>

      <Container className="mt-14 sm:mt-20">
        <div className="grid gap-14 md:grid-cols-3 md:gap-8">
          {SERVICES.map((s, i) => (
            <ServiceCard key={s.slug} service={s} photo={images[s.slug]} priority={i === 0} />
          ))}
        </div>
      </Container>

      <div className="mt-20 sm:mt-28">
        <PackageBuilder id="packages" />
      </div>

      <Container className="mt-16 sm:mt-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow mb-4">Ways to combine</p>
            <h2 className="display text-5xl sm:text-6xl">Common packages</h2>
            <p className="mt-4 max-w-md leading-relaxed text-ink-soft">
              These are the usual combinations. If yours is different, say so in the form and it gets quoted the same way.
            </p>
            <ul className="mt-8 border-t border-line">
              {COMBINATIONS.map((c) => (
                <li key={c} className="flex items-center gap-3 border-b border-line py-3.5">
                  <Check size={16} className="shrink-0 text-green" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-4">Questions</p>
            <h2 className="display text-5xl sm:text-6xl">Straight answers</h2>
            <dl className="mt-8 border-t border-line">
              {FAQ.map((f) => (
                <div key={f.q} className="border-b border-line py-4">
                  <dt className="display text-2xl">{f.q}</dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-ink-soft">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Container>

      <Container className="mt-20 sm:mt-28">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <Garland className="mb-6" />
          <h2 className="display text-5xl sm:text-6xl">How it works</h2>
        </div>
        <ProcessSteps />
      </Container>

      <Container className="mt-20 sm:mt-28">
        <div id="families" className="frame flex scroll-mt-24 flex-wrap items-center justify-between gap-6 p-7 sm:p-10">
          <div className="max-w-xl">
            <p className="eyebrow mb-3">After the wedding</p>
            <h2 className="display text-4xl sm:text-5xl">{FAMILY_SESSIONS.name}</h2>
            <p className="mt-2 leading-relaxed text-ink-soft">{FAMILY_SESSIONS.summary}</p>
          </div>
          <InquiryButton kind={FAMILY_SESSIONS.kind} variant="outline" size="lg">Ask about a session</InquiryButton>
        </div>
      </Container>

      <div className="mt-6">
        <PlannerBand />
      </div>

      <div className="mt-20 sm:mt-28">
        <CtaBand secondary={{ href: "/portfolio", label: "See the work" }} />
      </div>
    </>
  );
}
