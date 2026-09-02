import { requireAdmin } from "@/lib/admin";
import { CategoryForm } from "@/components/admin/category-form";
import { Badge } from "@/components/ui/badge";
import type { Category, Project } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const { supabase } = await requireAdmin();
  const [{ data: categories }, { data: projects }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order").order("name"),
    supabase.from("projects").select("id, title, category_id").order("title"),
  ]);
  const cats = (categories ?? []) as Category[];
  const projs = (projects ?? []) as Pick<Project, "id" | "title" | "category_id">[];

  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow mb-2">{cats.length} categories</p>
        <h1 className="display text-4xl">Categories</h1>
        <p className="mt-2 text-sm text-ink-soft max-w-xl">
          Categories group projects on the portfolio page. Order controls their position; unpublished categories are hidden from visitors along with their projects&apos; category pages.
        </p>
      </header>

      <div className="grid gap-4">
        {cats.map((c) => {
          const count = projs.filter((p) => p.category_id === c.id).length;
          return (
            <details key={c.id} className="outline-card group open:bg-paper">
              <summary className="flex cursor-pointer items-center gap-3 px-5 py-4 list-none [&::-webkit-details-marker]:hidden">
                <span className="font-mono text-xs text-ink-faint w-6">{c.sort_order}</span>
                <span className="display text-xl">{c.name}</span>
                <span className="text-xs text-ink-faint">/{c.slug} · {count} project{count === 1 ? "" : "s"}</span>
                <span className="ml-auto flex items-center gap-2">
                  {!c.is_published ? <Badge tone="outline">Hidden</Badge> : null}
                  <span className="text-xs text-ink-faint group-open:hidden">Edit</span>
                </span>
              </summary>
              <div className="border-t border-line px-5 py-5">
                <CategoryForm category={c} projects={projs} />
              </div>
            </details>
          );
        })}
      </div>

      <section className="outline-card p-5 space-y-4">
        <h2 className="display text-2xl">New category</h2>
        <CategoryForm projects={projs} />
      </section>
    </div>
  );
}
