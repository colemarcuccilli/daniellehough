import Link from "next/link";
import { ArrowRight, CalendarCheck, Images, MapPin, ShieldCheck } from "lucide-react";
import { getPortfolioIndex, getSiteImages } from "@/lib/queries";
import { Container } from "@/components/public/section";
import { Hero } from "@/components/public/hero";
import { ServiceCard } from "@/components/public/service-card";
import { PackageBuilder } from "@/components/public/package-builder";
import { ProcessSteps } from "@/components/public/process-steps";
import { PlannerBand } from "@/components/public/planner-band";
import { ProjectCard } from "@/components/public/project-card";
import { CtaBand } from "@/components/public/cta-band";
import { Garland, Wreath } from "@/components/public/greenery";
import { LogoMark } from "@/components/public/logo";
import { SERVICES } from "@/lib/content";

export const revalidate = 600;

const FACTS = [
  { icon: ShieldCheck, title: "Military-owned", body: "Dani serves in the Indiana National Guard and U.S. Air Force." },
  { icon: CalendarCheck, title: "One clear quote", body: "Everything priced together, in writing, before you book." },
  { icon: Images, title: "Online gallery", body: "Full-quality downloads for you and your family." },
  { icon: MapPin, title: "All of Indiana", body: "Based in Northeast Indiana. Travels statewide." },
];

const SHOWCASE = ["weddings", "families-couples"];

export default async function HomePage() {
  const [{ projects }, images] = await Promise.all([getPortfolioIndex(), getSiteImages()]);
  const showcase = projects
    .filter((p) => p.category && SHOWCASE.includes(p.category.slug) && p.cover)
    .sort(
      (a, b) =>
        SHOWCASE.indexOf(a.category!.slug) - SHOWCASE.indexOf(b.category!.slug) ||
        Number(b.slug.includes("proposal")) - Number(a.slug.includes("proposal")),
    )
    .slice(0, 3);

  return (
    <>
      <Hero photo={images.hero} />

      <section className="border-b border-line bg-cream">
        <Container>
          <ul className="grid divide-y divide-line sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
            {FACTS.map((f) => (
              <li key={f.title} className="flex items-start gap-3.5 py-5 lg:px-6 lg:first:pl-0 lg:last:pr-0">
                <f.icon size={19} className="mt-1 shrink-0 text-sage" />
                <span>
                  <span className="caps block text-[0.64rem] text-ink">{f.title}</span>
                  <span className="mt-1 block text-sm leading-snug text-ink-soft">{f.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section id="services" className="scroll-mt-20 pt-16 sm:pt-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Garland className="mb-6" />
            <h2 className="display text-5xl sm:text-6xl lg:text-7xl">What I photograph</h2>
            <p className="mt-4 text-[17px] leading-relaxed text-ink-soft">Book one, or put them together in a package.</p>
          </div>
          <div className="mt-12 grid gap-14 md:grid-cols-3 md:gap-8">
            {SERVICES.map((s, i) => (
              <ServiceCard key={s.slug} service={s} photo={images[s.slug]} priority={i === 0} />
            ))}
          </div>
        </Container>
      </section>

      <div className="mt-20 sm:mt-28">
        <PackageBuilder id="packages" />
      </div>

      <section className="pt-16 sm:pt-24">
        <Container>
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="eyebrow no-rule mb-4 justify-center">How it works</p>
            <h2 className="display text-5xl sm:text-6xl">Four steps, start to gallery</h2>
          </div>
          <ProcessSteps />
        </Container>
      </section>

      {showcase.length > 0 ? (
        <section className="pt-20 sm:pt-28">
          <Container>
            <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="eyebrow mb-4">Recent work</p>
                <h2 className="display text-5xl sm:text-6xl">Couples and families</h2>
              </div>
              <Link
                href="/portfolio"
                className="caps group inline-flex items-center gap-2 border-b border-sage pb-1 text-[0.64rem] transition-colors hover:border-marigold-deep hover:text-marigold-deep"
              >
                Full portfolio <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {showcase.map((p) => (
                <ProjectCard key={p.id} project={p} aspect="aspect-[4/5]" />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      <section className="pt-20 sm:pt-28">
        <Container>
          <div className="frame grid gap-8 p-7 sm:p-12 lg:grid-cols-[auto_1fr_auto] lg:items-center">
            <Wreath className="mx-auto h-28 w-28 text-sage lg:mx-0">
              <LogoMark height={46} />
            </Wreath>
            <div className="text-center lg:text-left">
              <p className="eyebrow no-rule mb-3 justify-center lg:justify-start">Your photographer</p>
              <h2 className="display text-4xl sm:text-5xl">Danielle Hough</h2>
              <p className="mt-3 max-w-2xl leading-relaxed text-ink-soft">
                Dani is a current member of the Indiana National Guard and the U.S. Air Force, where she works as a
                photographer. She plans ahead, shows up early, and gets the photo the first time.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 lg:items-end">
              <Link
                href="/about"
                className="caps group inline-flex items-center gap-2 border-b border-sage pb-1 text-[0.64rem] transition-colors hover:border-marigold-deep hover:text-marigold-deep"
              >
                About Dani <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="/portfolio/military-aviation" className="text-xs text-ink-faint underline-offset-4 hover:text-ink hover:underline">
                See her military work
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <div className="pt-10 sm:pt-12">
        <PlannerBand />
      </div>

      <div className="pt-20 sm:pt-28">
        <CtaBand />
      </div>
    </>
  );
}
