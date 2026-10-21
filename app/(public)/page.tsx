import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getHeroPhoto, getPortfolioIndex } from "@/lib/queries";
import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/public/section";
import { Hero } from "@/components/public/hero";
import { CategoryStack } from "@/components/public/category-stack";
import { CtaBand } from "@/components/public/cta-band";
import { InquiryButton } from "@/components/public/inquiry-modal";
import { LogoMark } from "@/components/public/logo";
import { MINI_SESSIONS, PLANS } from "@/lib/content";
import { pluralize } from "@/lib/utils";

export const revalidate = 600;

export default async function HomePage() {
  const [{ categories, projects }, hero] = await Promise.all([getPortfolioIndex(), getHeroPhoto()]);
  const totalPhotos = projects.reduce((n, p) => n + p.photo_count, 0);

  return (
    <>
      <Hero photo={hero} caption="Grissom Air Show 2026" />

      <section className="pt-16 sm:pt-24">
        <Container className="mb-8 sm:mb-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow mb-5">Portfolio</p>
              <h2 className="display text-6xl sm:text-7xl lg:text-8xl">Past projects</h2>
            </div>
            <p className="caps text-[0.62rem] text-ink-faint">
              {pluralize(categories.length, "category", "categories")} · {pluralize(projects.length, "project")} · {pluralize(totalPhotos, "photograph")}
            </p>
          </div>
        </Container>
        <CategoryStack categories={categories} />
      </section>

      <section className="mt-20 border-y border-line bg-cream py-16 sm:mt-28 sm:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="eyebrow mb-4 text-teal-deep [&::before]:bg-teal">For businesses</p>
              <h2 className="display text-5xl sm:text-6xl">
                Your business, <em className="serif-accent text-teal">photographed</em> on a schedule.
              </h2>
              <p className="mt-5 max-w-md text-[17px] leading-relaxed text-ink-soft">
                A capture day each quarter or each month. Edited, captioned, in your shared folder, ready to post.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <InquiryButton variant="primary" size="lg">Start a project</InquiryButton>
                <Link href="/services" className={buttonStyles({ variant: "outline", size: "lg" })}>
                  Services
                </Link>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {PLANS.map((p) => (
                <div key={p.slug} className="frame ribbon ribbon-teal p-6 sm:p-7">
                  <p className="caps text-[0.6rem] text-teal-deep">{p.tag}</p>
                  <h3 className="display mt-3 text-3xl">{p.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{p.summary}</p>
                </div>
              ))}
              <div className="frame flex flex-wrap items-center justify-between gap-3 p-5 text-sm sm:col-span-2">
                <span className="text-ink-soft">Not sure yet? Start with a headshot day.</span>
                <InquiryButton kind="headshots" variant="link" className="decoration-teal hover:text-teal-deep">
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
            <div id="mini-sessions" className="frame ribbon ribbon-purple flex flex-col bg-purple-soft/70 p-8 sm:p-10">
              <p className="eyebrow mb-4 text-purple-deep [&::before]:bg-purple">For families</p>
              <h2 className="display text-5xl">{MINI_SESSIONS.name}</h2>
              <p className="mt-3 leading-relaxed text-ink-soft">
                {MINI_SESSIONS.duration}. {MINI_SESSIONS.includes.join(". ")}. A few dates a year.
              </p>
              <div className="mt-8">
                <InquiryButton kind="mini_session" variant="sage" size="md">Get the next dates</InquiryButton>
              </div>
            </div>

            <div className="frame ribbon ribbon-green flex flex-col p-8 sm:p-10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow mb-4 text-green-deep [&::before]:bg-green">Behind the camera</p>
                  <h2 className="display text-5xl">Danielle Hough</h2>
                </div>
                <LogoMark height={64} className="hidden sm:block" />
              </div>
              <p className="mt-3 leading-relaxed text-ink-soft">
                Indiana National Guard and U.S. Air Force photographer. Shoots on a schedule, in whatever light there is,
                and delivers on time.
              </p>
              <div className="mt-auto pt-8">
                <Link
                  href="/about"
                  className="caps group inline-flex items-center gap-2 border-b border-sage pb-1 text-[0.64rem] transition-colors hover:border-marigold-deep hover:text-marigold-deep"
                >
                  About <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
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
