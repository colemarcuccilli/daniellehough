import type { Metadata } from "next";
import { Container } from "@/components/public/section";
import { PageHeader } from "@/components/public/page-header";
import { CtaBand } from "@/components/public/cta-band";
import { Wreath } from "@/components/public/greenery";
import { InquiryButton } from "@/components/public/inquiry-modal";
import { PLANNER_POINTS } from "@/lib/content";

export const metadata: Metadata = {
  title: "For wedding planners",
  description: "Partner with Dani Cams for wedding photography in Indiana and get your couples a better rate on photo, video, and wedding websites.",
};

const STEPS = [
  { title: "Reach out", body: "Tell me about your business and the weddings you plan." },
  { title: "Agree on a rate", body: "We set a partner rate your couples get every time." },
  { title: "Send your couples", body: "I quote them at that rate and keep you in the loop." },
];

export default function PlannersPage() {
  return (
    <>
      <PageHeader
        eyebrow="For wedding planners"
        title={
          <>
            Better rates <em className="serif-accent block text-marigold">for your couples.</em>
          </>
        }
        body="A long-term partnership with one photography team you can count on. Your couples pay less, and you have one less vendor to chase."
      >
        <InquiryButton kind="planner" variant="primary" size="lg">Partner with Dani Cams</InquiryButton>
      </PageHeader>

      <Container className="mt-14 sm:mt-20">
        <div className="grid gap-5 md:grid-cols-3">
          {PLANNER_POINTS.map((p) => (
            <div key={p.title} className="frame p-7 sm:p-8">
              <h2 className="display text-3xl sm:text-4xl">{p.title}</h2>
              <p className="mt-3 leading-relaxed text-ink-soft">{p.body}</p>
            </div>
          ))}
        </div>
      </Container>

      <Container className="mt-20 sm:mt-28">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="eyebrow no-rule mb-4 justify-center">How partnering works</p>
          <h2 className="display text-5xl sm:text-6xl">Three steps</h2>
        </div>
        <ol className="grid gap-10 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="text-center">
              <Wreath className="h-24 w-24 text-sage">
                <span className="display text-3xl text-ink">{i + 1}</span>
              </Wreath>
              <h3 className="display mt-4 text-3xl">{s.title}</h3>
              <p className="mx-auto mt-2 max-w-[17rem] text-sm leading-relaxed text-ink-soft">{s.body}</p>
            </li>
          ))}
        </ol>
      </Container>

      <Container className="mt-20 sm:mt-28">
        <div className="rounded-xs border border-line-strong bg-blush-soft p-7 text-center sm:p-12">
          <p className="caps text-[0.6rem] text-blush-deep">Who you would be working with</p>
          <p className="display mx-auto mt-3 max-w-3xl text-3xl sm:text-4xl">
            Danielle Hough is a current member of the Indiana National Guard and the U.S. Air Force. Dani Cams is military-owned and
            works across Indiana.
          </p>
        </div>
      </Container>

      <div className="mt-20 sm:mt-28">
        <CtaBand
          title={
            <>
              Let&rsquo;s work <em className="serif-accent text-marigold">together.</em>
            </>
          }
          body="Tell me about your planning business. I reply within two business days."
          kind="planner"
          primaryLabel="Partner with Dani Cams"
          secondary={{ href: "/portfolio", label: "See the work" }}
        />
      </div>
    </>
  );
}
