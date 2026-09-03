import type { Metadata } from "next";
import { Check, Plane, Smartphone, CalendarPlus } from "lucide-react";
import { ADD_ONS, MINI_SESSIONS, ONE_OFFS, PLANS, PROCESS } from "@/lib/content";
import { Container, SectionHeading } from "@/components/public/section";
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
      <Container className="pt-4 sm:pt-8">
        <SectionHeading
          size="lg"
          eyebrow="Services"
          title={<>Businesses on a schedule. <em className="serif-accent text-marigold-deep">Sessions</em> for everyone else.</>}
          body="Quarterly or monthly, a one-off shoot, or a mini session. Every inquiry goes through the same form."
        />
      </Container>

      {/* plans */}
      <Container className="mt-12">
        <div className="grid gap-5 lg:grid-cols-2">
          {PLANS.map((p) => (
            <article key={p.slug} id={p.slug} className="outline-card p-7 sm:p-9 flex flex-col">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-xs border border-teal bg-teal-soft px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-teal-deep">{p.tag}</span>
                <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-faint">{p.price}</span>
              </div>
              <h2 className="display text-3xl sm:text-4xl mt-5">{p.name}</h2>
              <p className="mt-3 text-ink-soft leading-relaxed">{p.summary}</p>
              <ul className="mt-6 grid gap-2.5">
                {p.includes.map((x) => (
                  <li key={x} className="flex gap-3 text-[15px]">
                    <Check size={16} className="mt-1 shrink-0 text-teal" />
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
              {p.terms ? (
                <ul className="mt-6 grid gap-1.5 border-t border-line pt-5 text-sm text-ink-soft">
                  {p.terms.map((t) => (
                    <li key={t} className="flex gap-2"><span className="text-ink-faint">—</span>{t}</li>
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
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-purple bg-purple-soft text-purple-deep">
                  <Icon size={18} />
                </span>
                <h3 className="display text-2xl mt-4">{a.name}</h3>
                <p className="mt-2 text-sm text-ink-soft leading-relaxed">{a.body}</p>
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
            <article key={o.slug} className="outline-card p-6 flex flex-col">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-faint">{o.price}</p>
              <h3 className="display text-2xl mt-3">{o.name}</h3>
              <p className="mt-2 text-sm text-ink-soft leading-relaxed">{o.summary}</p>
              <ul className="mt-4 grid gap-1.5 text-sm">
                {o.includes.map((x) => (
                  <li key={x} className="flex gap-2"><Check size={14} className="mt-1 shrink-0 text-green" />{x}</li>
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
      <section className="mt-20 sm:mt-28 bg-cream border-y border-ink py-16 sm:py-20">
        <Container>
          <SectionHeading eyebrow="How it works" title="Four steps" />
          <ol className="mt-10 grid gap-px bg-ink border border-ink rounded-md overflow-hidden md:grid-cols-4">
            {PROCESS.map((s) => (
              <li key={s.step} className="bg-paper p-6">
                <span className="display text-3xl text-green">{s.step}</span>
                <h3 className="mt-3 font-medium text-lg">{s.title}</h3>
                <p className="mt-2 text-sm text-ink-soft leading-relaxed">{s.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* mini sessions */}
      <Container className="mt-20 sm:mt-28">
        <div id="mini-sessions" className="grid gap-0 lg:grid-cols-2 rounded-md border border-ink overflow-hidden">
          <div className="bg-purple-soft p-8 sm:p-10">
            <p className="eyebrow mb-3 [&::before]:bg-purple text-purple-deep">For families & individuals</p>
            <h2 className="display text-4xl sm:text-5xl">{MINI_SESSIONS.name}</h2>
            <p className="mt-4 text-ink-soft leading-relaxed">{MINI_SESSIONS.summary}</p>
            <div className="mt-8 flex items-baseline gap-3">
              <span className="display text-5xl">{MINI_SESSIONS.price}</span>
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">{MINI_SESSIONS.duration}</span>
            </div>
          </div>
          <div className="bg-paper p-8 sm:p-10 flex flex-col border-t border-ink lg:border-t-0 lg:border-l">
            <ul className="grid gap-3">
              {MINI_SESSIONS.includes.map((x) => (
                <li key={x} className="flex gap-3"><Check size={16} className="mt-1 shrink-0 text-purple" />{x}</li>
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
