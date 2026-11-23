import { Plus, Video, MailOpen, Camera } from "lucide-react";
import { ADD_ONS } from "@/lib/content";
import { Branch } from "@/components/public/greenery";
import { Container } from "@/components/public/section";
import { InquiryButton } from "@/components/public/inquiry-modal";

const ICONS = { video: Video, website: MailOpen } as const;

/** "Start with photography, add what you need": the photo core plus the two partner add-ons. */
export function PackageBuilder({ id }: { id?: string }) {
  return (
    <section id={id} className="relative scroll-mt-20 overflow-hidden border-y border-line bg-sage-soft/60 py-16 sm:py-24">
      <Branch className="pointer-events-none absolute -right-8 top-6 hidden h-36 w-auto -scale-x-100 text-sage opacity-40 lg:block" />
      <Container className="relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow no-rule mb-4 justify-center">Packages</p>
          <h2 className="display text-5xl sm:text-6xl">
            Start with photos. <em className="serif-accent text-sage">Add what you need.</em>
          </h2>
          <p className="mt-4 text-[17px] leading-relaxed text-ink-soft">
            Every package is built for your wedding. The more you book together, the better the rate.
          </p>
        </div>

        <div className="mt-12 grid items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
          <div className="frame p-7 text-center">
            <Camera size={22} className="mx-auto text-sage" />
            <h3 className="display mt-4 text-3xl">Photography</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">Wedding day, engagement session, save the dates. Any one, or all three.</p>
            <p className="caps mt-5 text-[0.6rem] text-sage">Always included</p>
          </div>
          {ADD_ONS.map((a) => {
            const Icon = ICONS[a.slug as keyof typeof ICONS];
            return (
              <div key={a.slug} className="contents">
                <span className="grid place-items-center text-sage" aria-hidden>
                  <Plus size={22} />
                </span>
                <div className="frame border-dashed p-7 text-center">
                  <Icon size={22} className="mx-auto text-blush-deep" />
                  <h3 className="display mt-4 text-3xl">{a.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{a.summary}</p>
                  <p className="mt-4 border-t border-line pt-4 text-sm font-medium text-ink">{a.deal}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 text-center">
          <p className="max-w-md text-sm text-ink-soft">Tell me your date and what you want. You get one quote with everything in it.</p>
          <InquiryButton kind="wedding" variant="sage" size="lg">Get my quote</InquiryButton>
        </div>
      </Container>
    </section>
  );
}
