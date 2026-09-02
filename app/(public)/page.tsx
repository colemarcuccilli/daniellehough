import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, CalendarRange, Users } from "lucide-react";
import { getPortfolioIndex } from "@/lib/queries";
import { photoUrl } from "@/lib/images";
import { buttonStyles } from "@/components/ui/button";
import { Container, SectionHeading } from "@/components/public/section";
import { JustifiedGrid } from "@/components/public/justified-grid";
import { CategoryCard } from "@/components/public/category-card";
import { ProjectCard, projectHref } from "@/components/public/project-card";
import { CtaBand } from "@/components/public/cta-band";
import { LogoMark } from "@/components/public/logo";
import { MINI_SESSIONS, RETAINERS } from "@/lib/content";

export const revalidate = 600;

export default async function HomePage() {
  const { categories, projects } = await getPortfolioIndex();
  const featured = projects.filter((p) => p.is_featured && p.cover).slice(0, 6);
  const totalPhotos = projects.reduce((n, p) => n + p.photo_count, 0);

  return (
    <>
      {/* ---------------- hero ---------------- */}
      <section className="relative overflow-hidden">
        <Container className="pt-14 pb-10 sm:pt-20 sm:pb-14">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] items-end">
            <div className="rise">
              <p className="eyebrow mb-6">Danielle Nicole Hough · Photographer · Indiana</p>
              <h1 className="display text-[3.4rem] sm:text-7xl lg:text-[6.5rem] max-w-4xl">
                Pictures that <span className="mark-underline">do the work.</span>
              </h1>
              <p className="mt-8 max-w-xl text-lg sm:text-xl text-ink-soft leading-relaxed">
                VisionaryHaus shoots content retainers for businesses that need a steady stream of real photographs,
                plus headshot days, event coverage, and family sessions across Indiana.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link href="/portfolio" className={buttonStyles({ variant: "primary", size: "lg" })}>
                  See the portfolio <ArrowRight size={16} />
                </Link>
                <Link href="/services" className={buttonStyles({ variant: "outline", size: "lg" })}>
                  Business retainers
                </Link>
              </div>
            </div>

            <dl className="rise rise-2 grid grid-cols-3 gap-px border border-ink rounded-md overflow-hidden bg-ink lg:max-w-md lg:justify-self-end w-full">
              {[
                { k: "Projects", v: String(projects.length) },
                { k: "Photographs", v: String(totalPhotos) },
                { k: "Serving in", v: "USAF" },
              ].map((s) => (
                <div key={s.k} className="bg-paper p-4 sm:p-5">
                  <dt className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-faint">{s.k}</dt>
                  <dd className="display text-2xl sm:text-3xl mt-1 leading-none">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>

        {featured.length > 0 ? (
          <div className="rise rise-3 px-1 sm:px-2">
            <JustifiedGrid
              targets={{ mobile: 1.5, desktop: 3.6 }}
              items={featured.map((p) => ({
                key: p.id,
                ratio: p.cover!.width / p.cover!.height,
                href: projectHref(p),
                tone: p.cover!.dominant_color,
                ariaLabel: `${p.title} — ${p.category?.name ?? "project"}`,
                render: (sizes, i) => (
                  <>
                    <Image
                      src={photoUrl(p.cover!.web_path)}
                      alt={p.cover!.alt ?? p.title}
                      fill
                      sizes={sizes}
                      quality={75}
                      priority={i < 3}
                      placeholder={p.cover!.blur_data_url ? "blur" : "empty"}
                      blurDataURL={p.cover!.blur_data_url ?? undefined}
                    />
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 bg-gradient-to-t from-ink/70 to-transparent text-cream opacity-0 transition-opacity duration-300 [.tile:hover_&]:opacity-100">
                      <span className="display text-xl">{p.title}</span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em]">{p.category?.name}</span>
                    </span>
                  </>
                ),
              }))}
            />
          </div>
        ) : null}
      </section>

      {/* ---------------- categories ---------------- */}
      <section className="py-20 sm:py-28">
        <Container>
          <SectionHeading
            eyebrow="The work"
            title="Browse by category"
            body="Every photograph in its native proportion. Pick a category to see the projects inside it, or open the full portfolio."
            action={{ href: "/portfolio", label: "Full portfolio" }}
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c, i) => (
              <CategoryCard key={c.id} category={c} priority={i < 2} />
            ))}
          </div>
        </Container>
      </section>

      {/* ---------------- business ---------------- */}
      <section className="bg-slate-deep text-cream py-20 sm:py-28 border-y border-ink">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="eyebrow mb-3 text-cream/70 [&::before]:bg-marigold">For businesses</p>
              <h2 className="display text-4xl sm:text-5xl">Retainers first. Everything else rides along.</h2>
              <p className="mt-5 text-cream/75 leading-relaxed text-[17px] max-w-lg">
                The core of VisionaryHaus is a content retainer: a capture day on a schedule, edited and captioned,
                delivered into a shared library your team can actually post from. Manufacturing floors, clinics,
                franchises, job sites, restaurants.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/contact?kind=retainer" className={buttonStyles({ variant: "primary", size: "lg" })}>
                  Ask about a retainer
                </Link>
                <Link
                  href="/services"
                  className={buttonStyles({ variant: "outline", size: "lg" }) + " border-cream text-cream hover:bg-cream/10 hover:text-cream"}
                >
                  All services
                </Link>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {RETAINERS.map((r, i) => (
                <div key={r.slug} className="rounded-md border border-cream/25 bg-slate/40 p-6 flex flex-col">
                  <div className="flex items-center gap-2 text-marigold">
                    {i === 0 ? <CalendarRange size={18} /> : <Building2 size={18} />}
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.16em]">{r.tag}</span>
                  </div>
                  <h3 className="display text-2xl mt-4">{r.name}</h3>
                  <p className="mt-2 text-sm text-cream/75 leading-relaxed flex-1">{r.summary}</p>
                  <p className="mt-5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-cream/60">{r.price}</p>
                </div>
              ))}
              <div className="sm:col-span-2 rounded-md border border-cream/25 p-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Users size={18} className="text-marigold" />
                  <p className="text-sm text-cream/80">
                    Not ready for a retainer? A <strong className="text-cream">company headshot day</strong> is the cheapest way to find out you like working with me.
                  </p>
                </div>
                <Link href="/contact?kind=headshots" className="text-sm underline underline-offset-4 decoration-marigold hover:text-marigold">
                  Book a headshot day
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ---------------- featured projects ---------------- */}
      {featured.length > 0 ? (
        <section className="py-20 sm:py-28">
          <Container>
            <SectionHeading eyebrow="Selected projects" title="Recent work" action={{ href: "/portfolio", label: "All projects" }} />
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {/* ---------------- mini sessions + about ---------------- */}
      <section className="pb-20 sm:pb-28">
        <Container>
          <div className="grid gap-5 lg:grid-cols-2">
            <div id="mini-sessions" className="rounded-md border border-ink bg-marigold p-8 sm:p-10 flex flex-col">
              <p className="eyebrow mb-3 [&::before]:bg-ink text-ink/70">For families & individuals</p>
              <h2 className="display text-4xl">{MINI_SESSIONS.name}</h2>
              <p className="mt-4 text-ink/80 leading-relaxed">{MINI_SESSIONS.summary}</p>
              <ul className="mt-6 grid gap-2 text-sm">
                <li className="flex gap-3"><span className="font-mono text-ink/60">{MINI_SESSIONS.duration}</span><span>on location</span></li>
                {MINI_SESSIONS.includes.map((x) => (
                  <li key={x} className="flex gap-3"><span className="font-mono text-ink/60">+</span><span>{x}</span></li>
                ))}
              </ul>
              <div className="mt-8 flex items-center justify-between gap-4 flex-wrap">
                <span className="display text-3xl">{MINI_SESSIONS.price}</span>
                <Link href="/contact?kind=mini_session" className={buttonStyles({ variant: "ink", size: "md" })}>
                  Get the next dates
                </Link>
              </div>
            </div>

            <div className="rounded-md border border-ink bg-paper p-8 sm:p-10 flex flex-col">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow mb-3">Behind the camera</p>
                  <h2 className="display text-4xl">Danielle Nicole Hough</h2>
                </div>
                <LogoMark height={72} className="hidden sm:block opacity-90" />
              </div>
              <p className="mt-4 text-ink-soft leading-relaxed">
                A current member of the Indiana National Guard and the United States Air Force, Danielle photographs
                the way the military taught her to: on schedule, in whatever light the day offers, with no do-overs
                and a deadline that is real.
              </p>
              <p className="mt-3 text-ink-soft leading-relaxed">
                That is the standard VisionaryHaus brings to a factory floor, a clinic, a race weekend, or a family
                of six in the November woods.
              </p>
              <div className="mt-auto pt-8">
                <Link href="/about" className="group inline-flex items-center gap-1.5 text-sm font-medium border-b border-ink pb-0.5 hover:text-marigold-deep hover:border-marigold-deep transition-colors">
                  More about Danielle <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
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
