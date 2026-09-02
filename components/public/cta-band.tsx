import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { LogoMark } from "@/components/public/logo";

export function CtaBand({
  title = "Need a steady stream of real content?",
  body = "Business retainers are the core of what I do. Tell me what it should point at this quarter and I will send the sheet.",
  primary = { href: "/contact?kind=retainer", label: "Ask about a retainer" },
  secondary = { href: "/services", label: "See all services" },
}: {
  title?: string;
  body?: string;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <section className="mx-auto max-w-7xl px-5 sm:px-8">
      <div className="relative overflow-hidden rounded-md border border-ink bg-marigold px-6 py-12 sm:px-12 sm:py-16">
        <div className="pointer-events-none absolute -right-8 -bottom-16 opacity-[0.18] rotate-[14deg] hidden sm:block">
          <LogoMark height={340} />
        </div>
        <div className="relative max-w-2xl">
          <h2 className="display text-4xl sm:text-5xl">{title}</h2>
          <p className="mt-4 text-ink/80 text-[17px] leading-relaxed">{body}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={primary.href} className={buttonStyles({ variant: "ink", size: "lg" })}>
              {primary.label}
            </Link>
            <Link href={secondary.href} className={buttonStyles({ variant: "outline", size: "lg" })}>
              {secondary.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
