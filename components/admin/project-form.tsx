"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { createProject, updateProject } from "@/app/admin/actions";
import { slugify } from "@/lib/images";
import type { Category, Project } from "@/lib/types";

export function ProjectForm({ project, categories }: { project?: Project; categories: Category[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [title, setTitle] = useState(project?.title ?? "");
  const [slug, setSlug] = useState(project?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!project);
  const [published, setPublished] = useState(project?.is_published ?? true);
  const category = categories.find((c) => c.id === project?.category_id);
  const publicHref = project && category ? `/portfolio/${category.slug}/${project.slug}` : null;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    start(async () => {
      if (project) {
        const res = await updateProject(project.id, data);
        if (!res.ok) return void toast.error(res.error);
        toast.success("Saved");
        router.refresh();
      } else {
        const res = await createProject(data);
        if (!res.ok) return void toast.error(res.error);
        toast.success("Project created. Now add photos.");
        router.push(`/admin/projects/${res.data.id}`);
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-[1.4fr_1fr]">
        <Field label="Title" htmlFor="title">
          <Input
            id="title"
            name="title"
            required
            maxLength={120}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            placeholder="The Lennards"
            className="display text-xl h-12"
          />
        </Field>
        <Field label="URL slug" htmlFor="slug" hint="Lowercase letters, numbers, and dashes.">
          <Input
            id="slug"
            name="slug"
            maxLength={80}
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            onBlur={() => setSlug((s) => slugify(s))}
            placeholder="the-lennards"
            className="font-mono text-sm"
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Category" htmlFor="category_id">
          <Select id="category_id" name="category_id" defaultValue={project?.category_id ?? ""}>
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}{c.is_published ? "" : " (unpublished)"}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Shot on" htmlFor="shot_on">
          <Input id="shot_on" name="shot_on" type="date" defaultValue={project?.shot_on ?? ""} />
        </Field>
        <Field label="Order in category" htmlFor="sort_order" hint="Lower numbers come first.">
          <Input id="sort_order" name="sort_order" type="number" defaultValue={project?.sort_order ?? 0} />
        </Field>
      </div>

      <Field label="Subtitle" htmlFor="subtitle">
        <Input id="subtitle" name="subtitle" maxLength={200} defaultValue={project?.subtitle ?? ""} placeholder="In-home newborn session" />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Client (optional)" htmlFor="client">
          <Input id="client" name="client" maxLength={120} defaultValue={project?.client ?? ""} placeholder="Shown on the project page if set" />
        </Field>
        <Field label="Location (optional)" htmlFor="location">
          <Input id="location" name="location" maxLength={120} defaultValue={project?.location ?? ""} placeholder="Fort Wayne, Indiana" />
        </Field>
      </div>

      <Field label="Description" htmlFor="description">
        <Textarea id="description" name="description" rows={4} maxLength={6000} defaultValue={project?.description ?? ""} placeholder="A sentence or two about the shoot. Shown on the project page." />
      </Field>

      <div className="flex flex-wrap items-center gap-6 rounded-sm border border-line bg-cream px-4 py-3">
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_published" className="h-4 w-4 accent-[#1b1d1e]" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          Published on the site
        </label>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_featured" className="h-4 w-4 accent-[#1b1d1e]" defaultChecked={project?.is_featured ?? false} />
          Featured on the home page
        </label>
        {publicHref && project?.is_published ? (
          <Link href={publicHref} target="_blank" className="ml-auto inline-flex items-center gap-1.5 text-sm underline underline-offset-4 hover:text-marigold-deep">
            View on site <ExternalLink size={13} />
          </Link>
        ) : null}
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Saving…" : project ? "Save changes" : "Create project"}
        </Button>
      </div>
    </form>
  );
}
