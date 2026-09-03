import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { LogoMark } from "@/components/public/logo";
import { InquiryButton } from "@/components/public/inquiry-modal";
import type { InquiryKind } from "@/lib/types";

export function CtaBand({
  title = "Start a project.",
  body = "Tell me what the photographs need to do. I reply within two business days.",
  kind = "retainer",
  primaryLabel = "Start a project",
  secondary = { href: "/services", label: "Services" },
}: {
  title?: string;
  body?: string;
  kind?: InquiryKind;
  primaryLabel?: string;
  secondary?: { href: string; label: string };
}) {
  return (
    <section className="mx-auto max-w-7xl px-5 sm:px-8">
      <div className="relative overflow-hidden rounded-md border border-ink bg-marigold px-6 py-12 sm:px-12 sm:py-16">
        <div className="pointer-events-none absolute -right-8 -bottom-16 hidden rotate-[14deg] opacity-[0.18] sm:block">
          <LogoMark height={340} />
        </div>
        <div className="relative max-w-2xl">
          <h2 className="display text-4xl sm:text-5xl">{title}</h2>
          <p className="mt-4 text-ink/80 text-[17px] leading-relaxed">{body}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <InquiryButton kind={kind} variant="ink" size="lg">{primaryLabel}</InquiryButton>
            <Link href={secondary.href} className={buttonStyles({ variant: "outline", size: "lg" })}>
              {secondary.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
