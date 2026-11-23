import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { Branch } from "@/components/public/greenery";
import { InquiryButton } from "@/components/public/inquiry-modal";
import type { InquiryKind } from "@/lib/types";

/** Marigold band that closes every page: the ask, and who is behind the camera. */
export function CtaBand({
  title = "Check your date",
  body = "Danielle Hough. Indiana National Guard and U.S. Air Force. Military-owned.",
  kind = "wedding",
  primaryLabel = "Check your date",
  secondary = { href: "/planners", label: "For planners" },
}: {
  title?: React.ReactNode;
  body?: string;
  kind?: InquiryKind;
  primaryLabel?: string;
  secondary?: { href: string; label: string };
}) {
  return (
    <section className="relative overflow-hidden bg-marigold py-16 text-ink sm:py-24">
      <Branch className="pointer-events-none absolute -left-10 bottom-2 h-32 w-auto rotate-[10deg] text-marigold-deep opacity-60 sm:h-44" />
      <Branch className="pointer-events-none absolute -right-10 top-6 hidden h-44 w-auto -scale-x-100 -rotate-[16deg] text-marigold-deep opacity-60 sm:block" />
      <div className="relative mx-auto max-w-7xl px-5 text-center sm:px-8">
        <h2 className="display text-6xl sm:text-7xl lg:text-8xl">{title}</h2>
        <p className="mx-auto mt-5 max-w-xl text-lg">{body}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <InquiryButton kind={kind} variant="ink" size="lg">{primaryLabel}</InquiryButton>
          <Link href={secondary.href} className={buttonStyles({ variant: "outline", size: "lg" })}>
            {secondary.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
