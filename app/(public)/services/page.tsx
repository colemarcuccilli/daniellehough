import type { Metadata } from "next";
import { Check, Plane, Smartphone, CalendarPlus } from "lucide-react";
import { ADD_ONS, MINI_SESSIONS, ONE_OFFS, PLANS, PROCESS } from "@/lib/content";
import { Container, SectionHeading } from "@/components/public/section";
import { PageHeader } from "@/components/public/page-header";
import { CtaBand } from "@/components/public/cta-band";
import { InquiryButton } from "@/components/public/inquiry-modal";

export const metadata: Metadata = {
  title: "Services",
  description: "Quarterly and monthly photography for businesses, headshot days, product and event coverage, and mini sessions for families.",
};

const ADD_ON_ICONS = [Plane, Smartphone, CalendarPlus];

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Services"
        title={
          <>
            Businesses on a schedule. <em className="serif-accent text-marigold">Sessions</em> for everyone else.
          </>
        }
        body="Quarterly or monthly, a one-off shoot, or a mini session. Every inquiry goes through the same form."
      />

      {/* plans */}
      <Container className="mt-12 sm:mt-16">
        <div className="grid gap-5 lg:grid-cols-2">
          {PLANS.map((p) => (
            <article key={p.slug} id={p.slug} className="frame ribbon ribbon-teal flex flex-col p-7 sm:p-9">
              <p className="caps text-[0.6rem] text-teal-deep">{p.tag}</p>
              <h2 className="display mt-4 text-4xl sm:text-5xl">{p.name}</h2>
              <p className="mt-3 leading-relaxed text-ink-soft">{p.summary}</p>
              <ul className="mt-6 grid gap-2.5">
                {p.includes.map((x) => (
                  <li key={x} className="flex gap-3 text-[15px]">
                    <Check size={15} className="mt-1 shrink-0 text-teal" />
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
              {p.terms ? (
                <ul className="mt-6 grid gap-1.5 border-t border-line pt-5 text-sm text-ink-soft">
                  {p.terms.map((t) => (
                    <li key={t} className="flex gap-2">
                      <span className="text-ink-faint">—</span>
                      {t}
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="mt-auto pt-8">
                <InquiryButton kind={p.kind} variant="primary" size="md">Ask about {p.tag?.toLowerCase()}</InquiryButton>
              </div>
            </article>
          ))}
        </div>
      </Container>

      {/* add-ons */}
      <Container className="mt-20 sm:mt-28">
        <SectionHeading eyebrow="Add-ons" title="Add-ons" />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {ADD_ONS.map((a, i) => {
            const Icon = ADD_ON_ICONS[i] ?? Plane;
            return (
              <div key={a.name} className="outline-card-soft p-6">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xs border border-purple/40 bg-purple-soft text-purple-deep">
                  <Icon size={17} />
                </span>
                <h3 className="display mt-4 text-3xl">{a.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{a.body}</p>
              </div>
            );
          })}
        </div>
      </Container>

      {/* one-offs */}
      <Container className="mt-20 sm:mt-28">
        <SectionHeading eyebrow="One-off business work" title="Start small" body="A headshot day is the easiest first job." />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {ONE_OFFS.map((o) => (
            <article key={o.slug} className="frame ribbon ribbon-green flex flex-col p-6">
              <h3 className="display text-3xl">{o.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{o.summary}</p>
              <ul className="mt-4 grid gap-1.5 text-sm">
                {o.includes.map((x) => (
                  <li key={x} className="flex gap-2">
                    <Check size={14} className="mt-1 shrink-0 text-green" />
                    {x}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-6">
                <InquiryButton kind={o.kind} variant="outline" size="sm">Get a quote</InquiryButton>
              </div>
            </article>
          ))}
        </div>
      </Container>

      {/* process */}
      <section className="mt-20 border-y border-line bg-cream py-16 sm:mt-28 sm:py-20">
        <Container>
          <SectionHeading eyebrow="How it works" title="Four steps" />
          <ol className="mt-10 grid gap-px overflow-hidden rounded-xs border border-sage bg-line md:grid-cols-4">
            {PROCESS.map((s) => (
              <li key={s.step} className="bg-paper p-6">
                <span className="display text-4xl text-green">{s.step}</span>
                <h3 className="display mt-3 text-2xl">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* mini sessions */}
      <Container className="mt-20 sm:mt-28">
        <div id="mini-sessions" className="frame ribbon ribbon-purple grid gap-0 overflow-hidden lg:grid-cols-2">
          <div className="bg-purple-soft/70 p-8 sm:p-10">
            <p className="eyebrow mb-4 text-purple-deep [&::before]:bg-purple">For families & individuals</p>
            <h2 className="display text-5xl sm:text-6xl">{MINI_SESSIONS.name}</h2>
            <p className="mt-4 leading-relaxed text-ink-soft">{MINI_SESSIONS.summary}</p>
            <p className="display mt-8 text-5xl">{MINI_SESSIONS.duration}</p>
          </div>
          <div className="flex flex-col border-t border-line bg-paper p-8 sm:p-10 lg:border-t-0 lg:border-l">
            <ul className="grid gap-3">
              {MINI_SESSIONS.includes.map((x) => (
                <li key={x} className="flex gap-3">
                  <Check size={15} className="mt-1 shrink-0 text-purple" />
                  {x}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-ink-soft">{MINI_SESSIONS.upsell}</p>
            <div className="mt-auto pt-8">
              <InquiryButton kind={MINI_SESSIONS.kind} variant="primary" size="md">Get the next dates</InquiryButton>
            </div>
          </div>
        </div>
      </Container>

      <div className="mt-24">
        <CtaBand />
      </div>
    </>
  );
}
