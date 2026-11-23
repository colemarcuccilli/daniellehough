import { Check, Gift } from "lucide-react";
import { FILM_ADD_ON, PACKAGES } from "@/lib/content";
import { Container } from "@/components/public/section";
import { Branch } from "@/components/public/greenery";
import { InquiryButton } from "@/components/public/inquiry-modal";

/** Green band: the two photo packages with what comes free, then the film team as a separate hire. No prices yet. */
export function Offer({ id = "packages" }: { id?: string }) {
  return (
    <section id={id} className="relative scroll-mt-16 overflow-hidden bg-sage-deep py-16 text-cream sm:py-24">
      <Branch className="pointer-events-none absolute -right-10 top-10 hidden h-44 w-auto -scale-x-100 text-cream opacity-20 lg:block" />
      <Container className="relative">
        <h2 className="display mb-10 text-6xl sm:text-7xl lg:text-8xl">Packages</h2>
        <div className="grid gap-5 lg:grid-cols-2">
          {PACKAGES.map((p) => (
            <article key={p.name} className="flex flex-col rounded-xs bg-bg p-7 text-ink sm:p-10">
              <p className="caps text-[0.6rem] text-sage">Photo package</p>
              <h3 className="display mt-2 text-5xl sm:text-6xl">{p.name}</h3>
              <ul className="mt-7 grid gap-3">
                {p.includes.map((line) => (
                  <li key={line} className="flex gap-3">
                    <Check size={18} className="mt-1 shrink-0 text-green" />
                    {line}
                  </li>
                ))}
              </ul>
              <div className="mt-7 border-t border-line-strong pt-6">
                <p className="caps text-[0.6rem] text-clay-deep">Free with this package</p>
                <ul className="mt-3 grid gap-3">
                  {p.free.map((line) => (
                    <li key={line} className="flex gap-3 font-medium">
                      <Gift size={18} className="mt-1 shrink-0 text-clay-deep" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-auto pt-8">
                <InquiryButton kind={p.kind} variant="primary" size="lg">Check your date</InquiryButton>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-x-10 gap-y-4 rounded-xs border border-cream/35 p-7 sm:p-10">
          <div className="max-w-2xl">
            <p className="caps text-[0.6rem] text-marigold">In addition</p>
            <h3 className="display mt-2 text-4xl sm:text-5xl">{FILM_ADD_ON.name}</h3>
            <p className="mt-2 text-cream/80">{FILM_ADD_ON.body}</p>
          </div>
          <a href="#films" className="caps border-b border-cream/60 pb-1 text-[0.64rem] hover:border-marigold hover:text-marigold">
            Films
          </a>
        </div>
      </Container>
    </section>
  );
}
