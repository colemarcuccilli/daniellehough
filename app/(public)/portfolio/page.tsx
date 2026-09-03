import type { Metadata } from "next";
import { getPortfolioIndex } from "@/lib/queries";
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
  description: "Military and aviation, events, families and couples, portraits, and nature by Danielle Hough.",
};

export default async function PortfolioPage() {
  const { categories, projects } = await getPortfolioIndex();
  const totalPhotos = projects.reduce((n, p) => n + p.photo_count, 0);

  return (
    <>
      <PageHeader
        eyebrow="Portfolio"
        title="Past projects"
        body={`${pluralize(projects.length, "project")} · ${pluralize(totalPhotos, "photograph")}`}
      >
        <CategoryChips categories={categories} tone="dark" />
      </PageHeader>

      <div className="mt-2 sm:mt-3">
        <CategoryStack categories={categories} compact id="categories" />
      </div>

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
