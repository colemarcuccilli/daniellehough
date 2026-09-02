import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { ProjectForm } from "@/components/admin/project-form";
import { PhotoManager } from "@/components/admin/photo-manager";
import { DeleteProjectButton } from "./delete-button";
import type { Category, Photo, Project } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const [{ data: project }, { data: categories }, { data: photos }] = await Promise.all([
    supabase.from("projects").select("*").eq("id", id).maybeSingle(),
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("photos").select("*").eq("project_id", id).order("sort_order").order("created_at"),
  ]);
  if (!project) notFound();

  return (
    <div className="space-y-10">
      <div>
        <Link href="/admin/projects" className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
          <ArrowLeft size={14} /> Projects
        </Link>
        <h1 className="display text-4xl mt-4">{(project as Project).title}</h1>
      </div>

      <div className="outline-card p-6">
        <ProjectForm project={project as Project} categories={(categories ?? []) as Category[]} />
      </div>

      <PhotoManager project={project as Project} photos={(photos ?? []) as Photo[]} />

      <section className="rounded-md border border-coral/40 bg-coral-soft/40 p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-medium">Delete this project</p>
          <p className="text-sm text-ink-soft">Removes the project, its web photos, and its inquiries links. Originals stay in the PortfolioPhotos bucket.</p>
        </div>
        <DeleteProjectButton id={id} title={(project as Project).title} />
      </section>
    </div>
  );
}
