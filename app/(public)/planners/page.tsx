import type { Metadata } from "next";
import { Container } from "@/components/public/section";
import { PageHeader } from "@/components/public/page-header";
import { CtaBand } from "@/components/public/cta-band";
import { Wreath } from "@/components/public/greenery";
import { InquiryButton } from "@/components/public/inquiry-modal";
import { PLANNER_POINTS } from "@/lib/content";

export const metadata: Metadata = {
  title: "For wedding planners",
  description: "Wedding planner partnerships with Dani Cams: a partner rate for your couples on photo, film, and wedding websites.",
};

const STEPS = [
  { title: "Reach out", body: "Your business and the weddings you plan." },
  { title: "Set the rate", body: "One partner rate, for every couple." },
  { title: "Send couples", body: "They are quoted at that rate." },
];

export default function PlannersPage() {
  return (
    <>
      <PageHeader
        eyebrow="For wedding planners"
        title="Planner partnerships"
        body="A partner rate for your couples on photo, film, and wedding websites."
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
          <h2 className="display text-5xl sm:text-6xl">How it works</h2>
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

      <div className="mt-20 sm:mt-28">
        <CtaBand
          title="Partner with Dani Cams"
          kind="planner"
          primaryLabel="Reach out"
          secondary={{ href: "/portfolio", label: "Portfolio" }}
        />
      </div>
    </>
  );
}
