import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/public/section";

/** The side door for wedding planners: one line and a link, kept out of the couples' way. */
export function PlannerBand() {
  return (
    <Container>
      <Link
        href="/planners"
        className="group flex flex-wrap items-center justify-between gap-x-8 gap-y-3 rounded-xs border border-line-strong bg-blush-soft px-6 py-5 transition-colors hover:border-blush-deep sm:px-8"
      >
        <span>
          <span className="caps block text-[0.6rem] text-blush-deep">Wedding planners</span>
          <span className="display mt-1 block text-2xl sm:text-3xl">Partner with Dani Cams and get your couples a better rate.</span>
        </span>
        <span className="caps inline-flex items-center gap-2 border-b border-ink/60 pb-1 text-[0.64rem]">
          How it works <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>
    </Container>
  );
}
