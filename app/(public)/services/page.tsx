import type { Metadata } from "next";
import Link from "next/link";
import { Check, Plane, Smartphone, CalendarPlus } from "lucide-react";
import { ADD_ONS, MINI_SESSIONS, ONE_OFFS, PROCESS, RETAINERS } from "@/lib/content";
import { buttonStyles } from "@/components/ui/button";
import { Container, SectionHeading } from "@/components/public/section";
import { CtaBand } from "@/components/public/cta-band";

export const metadata: Metadata = {
  title: "Services & retainers",
  description:
    "Quarterly and monthly content retainers for businesses, drone and vertical video add-ons, headshot days, product and event coverage, and family mini sessions.",
};

const ADD_ON_ICONS = [Plane, Smartphone, CalendarPlus];

export default function ServicesPage() {
  return (
    <>
      <Container className="pt-14 sm:pt-20">
        <SectionHeading
          size="lg"
          eyebrow="Services"
          title="Retainers first. Everything else rides along."
          body="The core of VisionaryHaus is a content retainer that turns photography into a budget line instead of a project. One-off business work and consumer mini sessions sit around it."
        />
      </Container>

      {/* retainers */}
      <Container className="mt-14">
        <div className="grid gap-5 lg:grid-cols-2">
          {RETAINERS.map((r) => (
            <article key={r.slug} id={r.slug} className="outline-card p-7 sm:p-9 flex flex-col">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-xs bg-marigold border border-ink px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.16em]">{r.tag}</span>
                <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-faint">{r.price}</span>
              </div>
              <h2 className="display text-3xl sm:text-4xl mt-5">{r.name}</h2>
              <p className="mt-3 text-ink-soft leading-relaxed">{r.summary}</p>
              <ul className="mt-6 grid gap-2.5">
                {r.includes.map((x) => (
                  <li key={x} className="flex gap-3 text-[15px]">
                    <Check size={16} className="mt-1 shrink-0 text-marigold-deep" />
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
              {r.terms ? (
                <ul className="mt-6 grid gap-1.5 border-t border-line pt-5 text-sm text-ink-soft">
                  {r.terms.map((t) => (
                    <li key={t} className="flex gap-2"><span className="text-ink-faint">—</span>{t}</li>
                  ))}
                </ul>
              ) : null}
              {r.audience ? <p className="mt-5 text-sm text-ink-soft leading-relaxed">{r.audience}</p> : null}
              <div className="mt-auto pt-8">
                <Link href={`/contact?kind=${r.kind}`} className={buttonStyles({ variant: "primary", size: "md" })}>
                  Ask about this retainer
                </Link>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-5 text-sm text-ink-soft max-w-2xl">
          Both retainers deliver shot, edited, captioned photographs into a shared folder, ready to post. Managed
          posting is not included: I do not own your calendar or your comment section, which is exactly why the
          price stays where it is.
        </p>
      </Container>

      {/* add-ons */}
      <Container className="mt-20 sm:mt-28">
        <SectionHeading eyebrow="Add-ons" title="Ride-alongs on a retainer" />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {ADD_ONS.map((a, i) => {
            const Icon = ADD_ON_ICONS[i] ?? Plane;
            return (
              <div key={a.name} className="outline-card-soft p-6">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-ink bg-marigold-glow text-ink">
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
        <SectionHeading
          eyebrow="One-off business work"
          title="A foot in the door"
          body="Not every business is ready for a retainer. These are the standalone shoots, and the headshot day in particular is the cheapest way to find out what working together is like."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {ONE_OFFS.map((o) => (
            <article key={o.slug} className="outline-card p-6 flex flex-col">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-faint">{o.price}</p>
              <h3 className="display text-2xl mt-3">{o.name}</h3>
              <p className="mt-2 text-sm text-ink-soft leading-relaxed">{o.summary}</p>
              <ul className="mt-4 grid gap-1.5 text-sm">
                {o.includes.map((x) => (
                  <li key={x} className="flex gap-2"><Check size={14} className="mt-1 shrink-0 text-marigold-deep" />{x}</li>
                ))}
              </ul>
              <div className="mt-auto pt-6">
                <Link href={`/contact?kind=${o.kind}`} className={buttonStyles({ variant: "outline", size: "sm" })}>
                  Get a quote
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Container>

      {/* process */}
      <section className="mt-20 sm:mt-28 bg-cream border-y border-ink py-16 sm:py-20">
        <Container>
          <SectionHeading eyebrow="How it works" title="Four steps, every time" />
          <ol className="mt-10 grid gap-px bg-ink border border-ink rounded-md overflow-hidden md:grid-cols-4">
            {PROCESS.map((s) => (
              <li key={s.step} className="bg-paper p-6">
                <span className="display text-3xl text-marigold-deep">{s.step}</span>
                <h3 className="mt-3 font-medium text-lg">{s.title}</h3>
                <p className="mt-2 text-sm text-ink-soft leading-relaxed">{s.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* mini sessions */}
      <Container className="mt-20 sm:mt-28">
        <div id="mini-sessions" className="grid gap-8 lg:grid-cols-[1fr_1fr] rounded-md border border-ink overflow-hidden">
          <div className="bg-marigold p-8 sm:p-10">
            <p className="eyebrow mb-3 [&::before]:bg-ink text-ink/70">For families & individuals</p>
            <h2 className="display text-4xl sm:text-5xl">{MINI_SESSIONS.name}</h2>
            <p className="mt-4 text-ink/80 leading-relaxed">{MINI_SESSIONS.summary}</p>
            <div className="mt-8 flex items-baseline gap-3">
              <span className="display text-5xl">{MINI_SESSIONS.price}</span>
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink/70">{MINI_SESSIONS.duration}</span>
            </div>
          </div>
          <div className="bg-paper p-8 sm:p-10 flex flex-col">
            <ul className="grid gap-3">
              {MINI_SESSIONS.includes.map((x) => (
                <li key={x} className="flex gap-3"><Check size={16} className="mt-1 shrink-0 text-marigold-deep" />{x}</li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-ink-soft leading-relaxed">{MINI_SESSIONS.upsell}</p>
            <div className="mt-auto pt-8">
              <Link href={`/contact?kind=${MINI_SESSIONS.kind}`} className={buttonStyles({ variant: "primary", size: "md" })}>
                Get the next dates
              </Link>
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
