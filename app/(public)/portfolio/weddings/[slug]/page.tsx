import { notFound, redirect } from "next/navigation";
import { getWeddingProjects } from "@/lib/queries";

/** Earlier addresses for the wedding projects; each now opens its gallery page. */
export default async function WeddingProjectRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = (await getWeddingProjects()).find((p) => p.slug === slug);
  if (!project) notFound();
  redirect(project.href);
}
