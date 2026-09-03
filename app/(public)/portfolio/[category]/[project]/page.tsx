import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, Calendar, MapPin, User } from "lucide-react";
import { getProjectBySlug, getProjectNeighbours, getProjects } from "@/lib/queries";
import { photoUrl } from "@/lib/images";
import { Container } from "@/components/public/section";
import { PhotoGrid } from "@/components/public/photo-grid";
import { CtaBand } from "@/components/public/cta-band";
import { projectHref } from "@/components/public/project-card";
import { formatDate, pluralize } from "@/lib/utils";

export const revalidate = 600;

type Params = { category: string; project: string };

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ category: p.category?.slug ?? "all", project: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { project } = await params;
  const p = await getProjectBySlug(project);
  if (!p) return { title: "Project" };
  return {
    title: `${p.title}${p.category ? ` · ${p.category.name}` : ""}`,
    description: p.description ?? p.subtitle ?? `${p.title}, photographed by Danielle Nicole Hough.`,
    openGraph: p.cover ? { images: [{ url: photoUrl(p.cover.web_path), width: p.cover.width, height: p.cover.height }] } : undefined,
  };
}

export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const { category, project: slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();
  const canonical = projectHref(project);
  if (canonical !== `/portfolio/${category}/${slug}`) redirect(canonical);

  const { prev, next } = await getProjectNeighbours(project);
  const backHref = project.category ? `/portfolio/${project.category.slug}` : "/portfolio";

  const meta = [
    project.shot_on ? { icon: <Calendar size={14} />, text: formatDate(project.shot_on) } : null,
    project.location ? { icon: <MapPin size={14} />, text: project.location } : null,
    project.client ? { icon: <User size={14} />, text: project.client } : null,
  ].filter(Boolean) as { icon: React.ReactNode; text: string }[];

  return (
    <>
      <Container className="pt-12 sm:pt-16">
        <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
          <ArrowLeft size={14} /> {project.category?.name ?? "Portfolio"}
        </Link>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="eyebrow mb-3">{pluralize(project.photos.length, "photograph")}</p>
            <h1 className="display text-5xl sm:text-6xl lg:text-7xl">{project.title}</h1>
            {project.subtitle ? <p className="mt-4 text-xl text-ink-soft">{project.subtitle}</p> : null}
          </div>
          <div className="lg:justify-self-end lg:text-right">
            {meta.length > 0 ? (
              <ul className="flex flex-wrap gap-x-5 gap-y-2 lg:justify-end font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
                {meta.map((m) => (
                  <li key={m.text} className="inline-flex items-center gap-1.5">
                    <span className="text-marigold-deep">{m.icon}</span>
                    {m.text}
                  </li>
                ))}
              </ul>
            ) : null}
            {project.description ? (
              <p className="mt-4 text-ink-soft leading-relaxed max-w-md lg:ml-auto">{project.description}</p>
            ) : null}
          </div>
        </div>
      </Container>

      <div className="mt-10 sm:mt-14 px-1 sm:px-2">
        {project.photos.length > 0 ? (
          <PhotoGrid
            photos={project.photos.map((p) => ({
              id: p.id,
              web_path: p.web_path,
              width: p.width,
              height: p.height,
              alt: p.alt,
              caption: p.caption,
              blur_data_url: p.blur_data_url,
              dominant_color: p.dominant_color,
            }))}
          />
        ) : (
          <Container>
            <p className="outline-card-soft p-10 text-center text-ink-soft">Photos for this project are on their way.</p>
          </Container>
        )}
      </div>

      {prev || next ? (
        <Container className="mt-14">
          <nav className="grid gap-px border border-ink rounded-md overflow-hidden bg-ink sm:grid-cols-2" aria-label="Neighbouring projects">
            <div className="bg-paper p-5">
              {prev ? (
                <Link href={projectHref({ slug: prev.slug, category: project.category })} className="group flex items-center gap-3">
                  <ArrowLeft size={16} className="text-marigold-deep transition-transform group-hover:-translate-x-0.5" />
                  <span>
                    <span className="block font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">Previous</span>
                    <span className="display text-xl">{prev.title}</span>
                  </span>
                </Link>
              ) : (
                <span className="text-ink-faint text-sm">First in category</span>
              )}
            </div>
            <div className="bg-paper p-5 sm:text-right">
              {next ? (
                <Link href={projectHref({ slug: next.slug, category: project.category })} className="group flex items-center gap-3 sm:flex-row-reverse">
                  <ArrowRight size={16} className="text-marigold-deep transition-transform group-hover:translate-x-0.5" />
                  <span>
                    <span className="block font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">Next</span>
                    <span className="display text-xl">{next.title}</span>
                  </span>
                </Link>
              ) : (
                <span className="text-ink-faint text-sm">Last in category</span>
              )}
            </div>
          </nav>
        </Container>
      ) : null}

      <div className="mt-24">
        <CtaBand
          title="Something like this?"
          body="Tell me what it needs to do. Business or family, I reply within two business days."
        />
      </div>
    </>
  );
}
