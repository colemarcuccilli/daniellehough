"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { createCategory, deleteCategory, updateCategory } from "@/app/admin/actions";
import { slugify } from "@/lib/images";
import type { Category, Project } from "@/lib/types";

type ProjectOption = Pick<Project, "id" | "title" | "category_id">;

export function CategoryForm({ category, projects, onCreated }: { category?: Category; projects: ProjectOption[]; onCreated?: () => void }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!category);
  const inCategory = category ? projects.filter((p) => p.category_id === category.id) : [];

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    start(async () => {
      if (category) {
        const res = await updateCategory(category.id, data);
        if (!res.ok) return void toast.error(res.error);
        toast.success("Category saved");
      } else {
        const res = await createCategory(data);
        if (!res.ok) return void toast.error(res.error);
        toast.success("Category created");
        form.reset();
        setName("");
        setSlug("");
        setSlugTouched(false);
        onCreated?.();
      }
      router.refresh();
    });
  };

  const onDelete = () => {
    if (!category) return;
    if (!window.confirm(`Delete "${category.name}"? Its projects stay, but lose their category.`)) return;
    start(async () => {
      const res = await deleteCategory(category.id);
      if (!res.ok) return void toast.error(res.error);
      toast.success("Category deleted");
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-[1.3fr_1fr_100px]">
        <Field label="Name" htmlFor={`name-${category?.id ?? "new"}`}>
          <Input
            id={`name-${category?.id ?? "new"}`}
            name="name"
            required
            maxLength={80}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            placeholder="Business & Commercial"
          />
        </Field>
        <Field label="Slug" htmlFor={`slug-${category?.id ?? "new"}`}>
          <Input
            id={`slug-${category?.id ?? "new"}`}
            name="slug"
            maxLength={80}
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            onBlur={() => setSlug((s) => slugify(s))}
            className="font-mono text-sm"
          />
        </Field>
        <Field label="Order" htmlFor={`sort-${category?.id ?? "new"}`}>
          <Input id={`sort-${category?.id ?? "new"}`} name="sort_order" type="number" defaultValue={category?.sort_order ?? 0} />
        </Field>
      </div>
      <Field label="Tagline" htmlFor={`tagline-${category?.id ?? "new"}`} hint="One line under the category name.">
        <Input id={`tagline-${category?.id ?? "new"}`} name="tagline" maxLength={200} defaultValue={category?.tagline ?? ""} />
      </Field>
      <Field label="Description (optional)" htmlFor={`desc-${category?.id ?? "new"}`}>
        <Textarea id={`desc-${category?.id ?? "new"}`} name="description" rows={2} maxLength={4000} defaultValue={category?.description ?? ""} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2 items-end">
        {category ? (
          <Field label="Cover photo" htmlFor={`cover-${category.id}`} hint="Uses the chosen project's cover.">
            <Select id={`cover-${category.id}`} name="cover_project_id" defaultValue="">
              <option value="">Keep current cover</option>
              {inCategory.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </Select>
          </Field>
        ) : (
          <div />
        )}
        <label className="inline-flex items-center gap-2 text-sm pb-3">
          <input type="checkbox" name="is_published" defaultChecked={category?.is_published ?? true} className="h-4 w-4 accent-[#1b1d1e]" />
          Published on the site
        </label>
      </div>
      <div className="flex items-center justify-between gap-3 pt-1">
        {category ? (
          <Button variant="danger" size="sm" onClick={onDelete} disabled={pending}>
            <Trash2 size={14} /> Delete
          </Button>
        ) : (
          <span />
        )}
        <Button type="submit" variant="primary" size="sm" disabled={pending}>
          {pending ? "Saving…" : category ? "Save" : "Create category"}
        </Button>
      </div>
    </form>
  );
}
