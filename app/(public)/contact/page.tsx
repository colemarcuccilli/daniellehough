import type { Metadata } from "next";
import { Mail, MapPin, Clock } from "lucide-react";
import { InquiryForm } from "@/components/public/inquiry-form";
import { Container } from "@/components/public/section";
import { SITE } from "@/lib/content";
import type { InquiryKind } from "@/lib/types";

export const metadata: Metadata = {
  title: "Contact",
  description: "Ask about a content retainer, a headshot day, event coverage, or the next mini session dates.",
};

const KINDS: InquiryKind[] = ["retainer", "headshots", "event", "product", "mini_session", "other"];

const HEADLINES: Record<InquiryKind, string> = {
  retainer: "Tell me what it should point at this quarter.",
  headshots: "Let's get the whole team photographed in one visit.",
  event: "Tell me about the event.",
  product: "Tell me what needs to be photographed.",
  mini_session: "Get the next mini session dates.",
  other: "Tell me about the project.",
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const sp = await searchParams;
  const kind = (KINDS as string[]).includes(sp.kind ?? "") ? (sp.kind as InquiryKind) : "retainer";

  return (
    <Container className="pt-14 sm:pt-20 pb-8">
      <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="eyebrow mb-4">Contact</p>
          <h1 className="display text-5xl sm:text-6xl max-w-2xl">{HEADLINES[kind]}</h1>
          <p className="mt-6 text-ink-soft leading-relaxed max-w-xl">
            One form for everything. Pick what you need, tell me what the photographs have to do, and I will reply
            with a quote or the next available dates.
          </p>
          <div className="mt-10 outline-card p-6 sm:p-8 relative">
            <InquiryForm initialKind={kind} source="/contact" />
          </div>
        </div>

        <aside className="lg:pt-24 space-y-8">
          <div className="outline-card-soft p-6">
            <p className="eyebrow mb-4">Direct</p>
            <ul className="grid gap-4 text-sm">
              <li className="flex items-start gap-3">
                <Mail size={16} className="mt-0.5 text-marigold-deep" />
                <a href={`mailto:${SITE.email}`} className="hover:text-marigold-deep">{SITE.email}</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 text-marigold-deep" />
                <span>{SITE.region}</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock size={16} className="mt-0.5 text-marigold-deep" />
                <span>Replies within two business days. Drill weekends can add a day.</span>
              </li>
            </ul>
          </div>

          <div className="outline-card-soft p-6">
            <p className="eyebrow mb-4">What happens next</p>
            <ol className="grid gap-4">
              {[
                ["Reply", "You get a real answer, not an autoresponder, with a quote or a couple of questions."],
                ["Short call", "For retainers we pick the first quarter's target and lock the capture day."],
                ["Capture & deliver", "Shot, edited, captioned, and dropped into your shared folder."],
              ].map(([t, b], i) => (
                <li key={t} className="flex gap-4">
                  <span className="display text-2xl text-marigold-deep leading-none">0{i + 1}</span>
                  <div>
                    <p className="font-medium">{t}</p>
                    <p className="text-sm text-ink-soft leading-relaxed">{b}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <p className="text-xs text-ink-faint leading-relaxed">
            Event dates need two weeks notice on a retainer. Inside two weeks is still possible, it is just billed as
            rush.
          </p>
        </aside>
      </div>
    </Container>
  );
}
