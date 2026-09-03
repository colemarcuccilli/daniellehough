import type { Metadata } from "next";
import { getPortfolioIndex } from "@/lib/queries";
import { Container, SectionHeading } from "@/components/public/section";
import { CategoryStack } from "@/components/public/category-stack";
import { CategoryChips } from "@/components/public/category-chips";
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
      <Container className="pt-4 sm:pt-8 pb-8">
        <SectionHeading size="lg" eyebrow="Portfolio" title="Every category." body={`${projects.length} projects · ${totalPhotos} photographs`} />
        <CategoryChips categories={categories} className="mt-8" />
      </Container>

      <CategoryStack categories={categories} compact id="categories" />

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
