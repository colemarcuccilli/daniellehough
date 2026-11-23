import type { Metadata } from "next";
import { getPortfolioIndex, getWeddingWork } from "@/lib/queries";
import { PhotoGrid } from "@/components/public/photo-grid";
import { Container, SectionHeading } from "@/components/public/section";
import { PageHeader } from "@/components/public/page-header";
import { CategoryStack } from "@/components/public/category-stack";
import { CategoryChips } from "@/components/public/category-chips";
import { ProjectCard } from "@/components/public/project-card";
import { CtaBand } from "@/components/public/cta-band";
import { pluralize } from "@/lib/utils";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Couples, families, events, and more by Indiana wedding photographer Danielle Hough.",
};

export default async function PortfolioPage() {
  const [{ categories, projects }, work] = await Promise.all([getPortfolioIndex(), getWeddingWork()]);
  const weddingPhotos = [...work.weddings, ...work.engagements.filter((p) => !p.web_path.startsWith("lakeside-proposal/"))];
  const totalPhotos = projects.reduce((n, p) => n + p.photo_count, 0);

  return (
    <>
      <PageHeader
        eyebrow="The work"
        title="Portfolio"
        body={`${pluralize(projects.length, "project")} · ${pluralize(totalPhotos, "photograph")}`}
      >
        <CategoryChips categories={categories} tone="dark" />
      </PageHeader>

      {weddingPhotos.length > 0 ? (
        <section id="weddings" className="scroll-mt-20 pb-14 pt-12 sm:pb-20 sm:pt-16">
          <Container className="mb-8">
            <h2 className="display text-6xl sm:text-7xl">Weddings</h2>
          </Container>
          <div className="px-1 sm:px-2">
            <PhotoGrid photos={weddingPhotos} />
          </div>
        </section>
      ) : null}

      <div className="mt-2 sm:mt-3">
        <CategoryStack categories={categories} compact id="categories" />
      </div>

      <Container className="mt-20 sm:mt-28">
        <SectionHeading title="All projects" />
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
