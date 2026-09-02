import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { ProjectForm } from "@/components/admin/project-form";
import type { Category } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("categories").select("*").order("sort_order");
  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <Link href="/admin/projects" className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
          <ArrowLeft size={14} /> Projects
        </Link>
        <h1 className="display text-4xl mt-4">New project</h1>
        <p className="mt-2 text-sm text-ink-soft">Create the project first, then upload or import its photos.</p>
      </div>
      <div className="outline-card p-6">
        <ProjectForm categories={(data ?? []) as Category[]} />
      </div>
    </div>
  );
}
