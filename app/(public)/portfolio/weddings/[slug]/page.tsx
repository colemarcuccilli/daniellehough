import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getWeddingProject } from "@/lib/queries";
import { photoUrl } from "@/lib/images";
import { PageHeader } from "@/components/public/page-header";
import { PhotoGrid } from "@/components/public/photo-grid";
import { CtaBand } from "@/components/public/cta-band";
import { WEDDING_PROJECTS } from "@/lib/content";

export const revalidate = 600;

type Params = { slug: string };

export function generateStaticParams() {
  return WEDDING_PROJECTS.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getWeddingProject(slug);
  if (!p) return { title: "Project" };
  return {
    title: p.title,
    description: `${p.title}. ${p.kind} photography by Danielle Hough.`,
    openGraph: p.cover ? { images: [{ url: photoUrl(p.cover.web_path), width: p.cover.width, height: p.cover.height }] } : undefined,
  };
}

export default async function WeddingProjectPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const project = await getWeddingProject(slug);
  if (!project) notFound();
  return (
    <>
      <PageHeader
        eyebrow={
          <Link href="/portfolio" className="inline-flex items-center gap-1.5 hover:text-marigold">
            <ArrowLeft size={12} /> Portfolio · {project.kind}
          </Link>
        }
        title={project.title}
        body={project.place}
      />
      <div className="px-1 py-2 sm:px-2 sm:py-3">
        <PhotoGrid photos={project.photos} />
      </div>
      <div className="mt-14">
        <CtaBand />
      </div>
    </>
  );
}
