import type { MetadataRoute } from "next";
import { getCategories } from "@/lib/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://danicams.com";
  const categories = await getCategories();
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/portfolio`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/planners`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    ...categories.map((c) => ({ url: `${base}/portfolio/${c.slug}`, lastModified: new Date(c.updated_at), changeFrequency: "weekly" as const, priority: 0.7 })),
  ];
}
