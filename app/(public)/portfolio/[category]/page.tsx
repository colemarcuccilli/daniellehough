import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCategories, getCategoryBySlug, getPhotosInCategory, getProjects } from "@/lib/queries";
import { Container, SectionHeading } from "@/components/public/section";
import { CategoryChips } from "@/components/public/category-chips";
import { ProjectCard } from "@/components/public/project-card";
import { PhotoGrid } from "@/components/public/photo-grid";
import { CtaBand } from "@/components/public/cta-band";
import { pluralize } from "@/lib/utils";

export const revalidate = 600;

type Params = { category: string };

export async function generateStaticParams() {
  const cats = await getCategories();
  return cats.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { category } = await params;
  const cat = await getCategoryBySlug(category);
  if (!cat) return { title: "Portfolio" };
  return { title: `${cat.name} photography`, description: cat.tagline ?? cat.description ?? undefined };
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const { category } = await params;
  const cat = await getCategoryBySlug(category);
  if (!cat) notFound();
  const [projects, photos, all] = await Promise.all([getProjects({ categoryId: cat.id }), getPhotosInCategory(cat.id), getCategories()]);

  return (
    <>
      <Container className="pt-4 sm:pt-8">
        <Link href="/portfolio" className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
          <ArrowLeft size={14} /> Portfolio
        </Link>
        <div className="mt-6">
          <SectionHeading
            size="lg"
            eyebrow={`${pluralize(projects.length, "project")} · ${pluralize(photos.length, "photograph")}`}
            title={cat.name}
            body={cat.tagline ?? cat.description ?? undefined}
          />
        </div>
        <CategoryChips categories={all} activeSlug={cat.slug} className="mt-8" />
      </Container>

      {projects.length > 0 ? (
        <Container className="mt-12">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <ProjectCard key={p.id} project={p} priority={i < 3} />
            ))}
          </div>
        </Container>
      ) : (
        <Container className="mt-12">
          <p className="outline-card-soft p-10 text-center text-ink-soft">Nothing published here yet.</p>
        </Container>
      )}

      {photos.length > 0 ? (
        <section className="mt-20 sm:mt-28">
          <Container>
            <SectionHeading eyebrow="Everything in this category" title={`All ${cat.name.toLowerCase()} photographs`} />
          </Container>
          <div className="mt-8 px-1 sm:px-2">
            <PhotoGrid
              photos={photos.map((p) => ({
                id: p.id,
                web_path: p.web_path,
                width: p.width,
                height: p.height,
                alt: p.alt,
                caption: p.caption ?? p.project.title,
                blur_data_url: p.blur_data_url,
                dominant_color: p.dominant_color,
                label: p.project.title,
              }))}
              priorityCount={0}
            />
          </div>
        </section>
      ) : null}

      <div className="mt-24">
        <CtaBand />
      </div>
    </>
  );
}
