import Link from "next/link";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CategoryChips({
  categories,
  activeSlug,
  className,
  tone = "light",
}: {
  categories: Pick<Category, "id" | "slug" | "name">[];
  activeSlug?: string;
  className?: string;
  tone?: "light" | "dark";
}) {
  const chip = (active: boolean) =>
    cn(
      "rounded-xs border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors",
      tone === "dark"
        ? active
          ? "border-marigold bg-marigold text-ink"
          : "border-cream/40 text-cream/85 hover:border-marigold hover:text-marigold"
        : active
          ? "border-ink bg-ink text-cream"
          : "border-ink hover:bg-marigold",
    );
  return (
    <nav aria-label="Categories" className={cn("flex flex-wrap gap-2", className)}>
      <Link href="/portfolio" className={chip(!activeSlug)} aria-current={!activeSlug ? "page" : undefined}>
        All
      </Link>
      {categories.map((c) => (
        <Link key={c.id} href={`/portfolio/${c.slug}`} className={chip(c.slug === activeSlug)} aria-current={c.slug === activeSlug ? "page" : undefined}>
          {c.name}
        </Link>
      ))}
    </nav>
  );
}
