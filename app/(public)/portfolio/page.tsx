import type { Metadata } from "next";
import Link from "next/link";
import { getPortfolioIndex } from "@/lib/queries";
import { Container, SectionHeading } from "@/components/public/section";
import { CategoryCard } from "@/components/public/category-card";
import { ProjectCard } from "@/components/public/project-card";
import { CtaBand } from "@/components/public/cta-band";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Military and aviation, events, families, couples, portraits, nature, and creative work by Danielle Nicole Hough.",
};

export default async function PortfolioPage() {
  const { categories, projects } = await getPortfolioIndex();
  const totalPhotos = projects.reduce((n, p) => n + p.photo_count, 0);

  return (
    <>
      <Container className="pt-14 sm:pt-20">
        <SectionHeading
          size="lg"
          eyebrow="Portfolio"
          title="Every category, every project."
          body={`${projects.length} projects and ${totalPhotos} photographs, each shown at its native proportion.`}
        />
        <nav aria-label="Categories" className="mt-8 flex flex-wrap gap-2">
          <span className="rounded-xs border border-ink bg-ink px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-cream">All</span>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/portfolio/${c.slug}`}
              className="rounded-xs border border-ink px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] hover:bg-marigold transition-colors"
            >
              {c.name}
            </Link>
          ))}
        </nav>
      </Container>

      <Container className="mt-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c, i) => (
            <CategoryCard key={c.id} category={c} priority={i < 4} />
          ))}
        </div>
      </Container>

      <Container className="mt-20 sm:mt-28">
        <SectionHeading eyebrow="All projects" title="Latest first" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...projects]
            .sort((a, b) => (b.shot_on ?? b.created_at).localeCompare(a.shot_on ?? a.created_at))
            .map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
        </div>
      </Container>

      <div className="mt-24">
        <CtaBand />
      </div>
    </>
  );
}
