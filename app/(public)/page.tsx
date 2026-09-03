import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { getPortfolioIndex } from "@/lib/queries";
import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/public/section";
import { CategoryStack } from "@/components/public/category-stack";
import { CtaBand } from "@/components/public/cta-band";
import { InquiryButton } from "@/components/public/inquiry-modal";
import { LogoMark } from "@/components/public/logo";
import { MINI_SESSIONS, PLANS } from "@/lib/content";

export const revalidate = 600;

export default async function HomePage() {
  const { categories } = await getPortfolioIndex();

  return (
    <>
      <section>
        <Container className="pt-12 pb-8 sm:pt-16 sm:pb-10">
          <p className="eyebrow mb-5">Dani Cams · Danielle Nicole Hough · Indiana</p>
          <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <h1 className="display text-[3.2rem] sm:text-7xl lg:text-[6rem] max-w-4xl rise">
              Pictures that <span className="mark-underline">do the work.</span>
            </h1>
            <div className="rise rise-2 lg:pb-3">
              <p className="text-lg text-ink-soft leading-relaxed">Photography for businesses and families across Indiana.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="#portfolio" className={buttonStyles({ variant: "primary", size: "lg" })}>
                  See the portfolio <ArrowDown size={16} />
                </a>
                <InquiryButton variant="outline" size="lg">Start a project</InquiryButton>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <CategoryStack categories={categories} />

      <section className="mt-20 sm:mt-28 bg-teal-deep text-cream border-y border-ink py-16 sm:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="eyebrow mb-3 text-cream/70 [&::before]:bg-marigold">For businesses</p>
              <h2 className="display text-4xl sm:text-5xl">Ongoing content, on a schedule.</h2>
              <p className="mt-4 text-cream/80 text-[17px] leading-relaxed max-w-md">
                A capture day each quarter or each month. Edited, captioned, delivered to a shared folder, ready to post.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <InquiryButton variant="primary" size="lg">Start a project</InquiryButton>
                <Link
                  href="/services"
                  className={buttonStyles({ variant: "outline", size: "lg" }) + " border-cream text-cream hover:bg-cream/10 hover:text-cream"}
                >
                  Services
                </Link>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {PLANS.map((p) => (
                <div key={p.slug} className="rounded-md border border-cream/30 bg-teal/40 p-6">
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-marigold">{p.price}</p>
                  <h3 className="display text-2xl mt-3">{p.name}</h3>
                  <p className="mt-2 text-sm text-cream/80 leading-relaxed">{p.summary}</p>
                </div>
              ))}
              <div className="sm:col-span-2 rounded-md border border-cream/30 p-5 flex flex-wrap items-center justify-between gap-3 text-sm">
                <span className="text-cream/85">Not sure yet? Start with a headshot day.</span>
                <InquiryButton kind="headshots" variant="link" className="text-cream decoration-marigold hover:text-marigold">
                  Book a headshot day <ArrowRight size={14} />
                </InquiryButton>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-24">
        <Container>
          <div className="grid gap-5 lg:grid-cols-2">
            <div id="mini-sessions" className="rounded-md border border-ink bg-purple-soft p-8 sm:p-10 flex flex-col">
              <p className="eyebrow mb-3 [&::before]:bg-purple text-purple-deep">For families</p>
              <h2 className="display text-4xl">{MINI_SESSIONS.name}</h2>
              <p className="mt-3 text-ink-soft leading-relaxed">
                {MINI_SESSIONS.duration}. {MINI_SESSIONS.includes.join(". ")}. A few dates a year.
              </p>
              <div className="mt-8 flex items-center justify-between gap-4 flex-wrap">
                <span className="display text-3xl">{MINI_SESSIONS.price}</span>
                <InquiryButton kind="mini_session" variant="ink" size="md">Get the next dates</InquiryButton>
              </div>
            </div>

            <div className="rounded-md border border-ink bg-paper p-8 sm:p-10 flex flex-col">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow mb-3 [&::before]:bg-green">Behind the camera</p>
                  <h2 className="display text-4xl">Danielle Nicole Hough</h2>
                </div>
                <LogoMark height={64} className="hidden sm:block" />
              </div>
              <p className="mt-3 text-ink-soft leading-relaxed">
                Indiana National Guard and U.S. Air Force photographer. Shoots on a schedule, in whatever light there is,
                and delivers on time.
              </p>
              <div className="mt-auto pt-8">
                <Link href="/about" className="group inline-flex items-center gap-1.5 text-sm font-medium border-b border-ink pb-0.5 hover:text-marigold-deep hover:border-marigold-deep transition-colors">
                  About <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
