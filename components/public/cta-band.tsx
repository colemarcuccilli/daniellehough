import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { Branch } from "@/components/public/greenery";
import { InquiryButton } from "@/components/public/inquiry-modal";
import type { InquiryKind } from "@/lib/types";

/** The sage "total" band from the stationery: solid fill, inset hairline, sprigs in the corners. */
export function CtaBand({
  title = (
    <>
      Is your date <em className="serif-accent text-marigold">open?</em>
    </>
  ),
  body = "Send your date and what you need. I reply within two business days with a clear quote.",
  kind = "wedding",
  primaryLabel = "Check your date",
  secondary = { href: "/services", label: "Services and packages" },
}: {
  title?: React.ReactNode;
  body?: string;
  kind?: InquiryKind;
  primaryLabel?: string;
  secondary?: { href: string; label: string };
}) {
  return (
    <section className="mx-auto max-w-7xl px-5 sm:px-8">
      <div className="frame-inset relative overflow-hidden rounded-xs bg-sage-deep px-6 py-14 text-cream sm:px-12 sm:py-20">
        <Branch className="pointer-events-none absolute -right-10 top-4 hidden h-44 w-auto -scale-x-100 -rotate-[18deg] text-cream opacity-35 sm:block" />
        <Branch className="pointer-events-none absolute -bottom-6 -left-10 h-32 w-auto rotate-[14deg] text-cream opacity-25 sm:h-40" />
        <div className="relative max-w-2xl">
          <p className="eyebrow mb-5 text-cream/70 [&::before]:bg-marigold">Get in touch</p>
          <h2 className="display text-5xl sm:text-6xl">{title}</h2>
          <p className="mt-4 text-cream/80 text-[17px] leading-relaxed">{body}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <InquiryButton kind={kind} variant="primary" size="lg">{primaryLabel}</InquiryButton>
            <Link href={secondary.href} className={buttonStyles({ variant: "cream", size: "lg" })}>
              {secondary.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
