import type { MetadataRoute } from "next";
import { getCategories, getProjects } from "@/lib/queries";
import { projectHref } from "@/components/public/project-card";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://danicams.com";
  const [categories, projects] = await Promise.all([getCategories(), getProjects()]);
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/portfolio`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    ...categories.map((c) => ({ url: `${base}/portfolio/${c.slug}`, lastModified: new Date(c.updated_at), changeFrequency: "weekly" as const, priority: 0.7 })),
    ...projects.map((p) => ({ url: `${base}${projectHref(p)}`, lastModified: new Date(p.updated_at), changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
