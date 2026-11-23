import { OFFER } from "@/lib/content";
import { Container } from "@/components/public/section";
import { Branch } from "@/components/public/greenery";
import { InquiryButton } from "@/components/public/inquiry-modal";

/** Blush band: the offer as a plain list. No prices until the owner sets them. */
export function Offer({ id = "packages" }: { id?: string }) {
  return (
    <section id={id} className="relative scroll-mt-16 overflow-hidden bg-blush py-16 sm:py-24">
      <Branch className="pointer-events-none absolute -right-10 top-8 hidden h-40 w-auto -scale-x-100 text-clay opacity-50 lg:block" />
      <Container className="relative">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <h2 className="display text-6xl sm:text-7xl lg:text-8xl">Packages</h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed">
              Photography, with film and a wedding website added. Booked together, each costs less.
            </p>
            <div className="mt-8">
              <InquiryButton kind="wedding" variant="ink" size="lg">Check your date</InquiryButton>
            </div>
          </div>
          <ol className="border-t border-ink/25">
            {OFFER.map((o, i) => (
              <li key={o.name} className="grid grid-cols-[2.5rem_1fr] items-baseline gap-x-4 border-b border-ink/25 py-5 sm:grid-cols-[3rem_13rem_1fr]">
                <span className="display text-2xl text-clay-deep">{i === 0 ? "" : "+"}</span>
                <h3 className="display text-3xl sm:text-4xl">{o.name}</h3>
                <p className="col-start-2 mt-1 text-ink-soft sm:col-start-3 sm:mt-0">{o.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
