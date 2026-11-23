import type { Metadata } from "next";
import { getProjects, getWeddingProjects } from "@/lib/queries";
import { Container } from "@/components/public/section";
import { PageHeader } from "@/components/public/page-header";
import { ProjectCard } from "@/components/public/project-card";
import { WeddingProjectCard } from "@/components/public/wedding-project-card";
import { CtaBand } from "@/components/public/cta-band";
import { CATEGORY_ORDER, COUPLES_PROJECT_SLUGS, FAMILY_PROJECT_SLUGS } from "@/lib/content";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Weddings, engagements, and save the dates by Danielle Hough, then family and side projects.",
};

export default async function PortfolioPage() {
  const [weddings, projects] = await Promise.all([getWeddingProjects(), getProjects()]);
  const couples = projects.filter((p) => COUPLES_PROJECT_SLUGS.includes(p.slug));
  const rank = (slug?: string) => {
    const i = CATEGORY_ORDER.indexOf(slug ?? "");
    return i === -1 ? CATEGORY_ORDER.length : i;
  };
  const families = FAMILY_PROJECT_SLUGS.flatMap((slug) => projects.filter((p) => p.slug === slug));
  const side = projects
    .filter((p) => !COUPLES_PROJECT_SLUGS.includes(p.slug) && !FAMILY_PROJECT_SLUGS.includes(p.slug))
    .sort((a, b) => rank(a.category?.slug) - rank(b.category?.slug) || (b.shot_on ?? b.created_at).localeCompare(a.shot_on ?? a.created_at));

  return (
    <>
      <PageHeader eyebrow="Portfolio" title="Projects" />

      <Container className="pt-12 sm:pt-16">
        <section id="weddings" className="scroll-mt-24">
          <h2 className="display text-5xl sm:text-6xl">Wedding projects</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {weddings
              .filter((w) => w.kind === "Wedding")
              .map((w, i) => (
                <WeddingProjectCard key={w.slug} project={w} priority={i < 2} />
              ))}
          </div>
        </section>

        <section id="engagements" className="scroll-mt-24 pt-14 sm:pt-20">
          <h2 className="display text-5xl sm:text-6xl">Engagement and save-the-date projects</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {weddings
              .filter((w) => w.kind !== "Wedding")
              .map((w) => (
                <WeddingProjectCard key={w.slug} project={w} />
              ))}
            {couples.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </section>

        <section id="families" className="scroll-mt-24 py-14 sm:py-20">
          <h2 className="display text-5xl sm:text-6xl">Family projects</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {families.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </section>
      </Container>

      <section id="side-projects" className="scroll-mt-24 border-t border-line bg-cream py-14 sm:py-20">
        <Container>
          <h2 className="display text-5xl sm:text-6xl">Side projects</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {side.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
