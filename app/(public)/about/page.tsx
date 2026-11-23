import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getProjects } from "@/lib/queries";
import { photoUrl } from "@/lib/images";
import { buttonStyles } from "@/components/ui/button";
import { Container, SectionHeading } from "@/components/public/section";
import { PageHeader } from "@/components/public/page-header";
import { JustifiedGrid } from "@/components/public/justified-grid";
import { projectHref } from "@/components/public/project-card";
import { LogoMark } from "@/components/public/logo";
import { CtaBand } from "@/components/public/cta-band";
import { InquiryButton } from "@/components/public/inquiry-modal";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "About",
  description: "Danielle Hough is an Indiana wedding photographer and a current member of the Indiana National Guard and the United States Air Force.",
};

const PRINCIPLES = [
  { title: "Photo, recap, website", body: "Recap video and wedding website included." },
  { title: "Online gallery", body: "Private. Full-quality downloads." },
  { title: "Indiana and destination", body: "Based in Northeast Indiana. Travels." },
];

export default async function AboutPage() {
  const projects = await getProjects();
  const strip = projects
    .filter((p) => p.cover && p.category && ["weddings", "families-couples"].includes(p.category.slug))
    .slice(0, 5);

  return (
    <>
      <PageHeader
        eyebrow="Dani Cams"
        title="Danielle Hough"
        body="Wedding photographer, based in Indiana. Current member of the Indiana National Guard and the United States Air Force."
      />

      <Container className="mt-12 sm:mt-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-start">
          <div>
            <div className="prose-basic text-lg text-ink-soft leading-relaxed max-w-xl">
              <p>
                I photograph weddings, engagements, and save the dates in Indiana and at destination weddings. I serve in the
                Indiana National Guard and the U.S. Air Force as a photographer.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <InquiryButton kind="wedding" variant="primary" size="lg">Check your date</InquiryButton>
              <Link href="/portfolio" className={buttonStyles({ variant: "outline", size: "lg" })}>
                Portfolio
              </Link>
            </div>
          </div>
          <div className="frame ribbon ribbon-marigold p-8 sm:p-10 lg:justify-self-end w-full max-w-md">
            <LogoMark height={110} />
            <dl className="mt-8 grid gap-4">
              {[
                ["Based in", "Indiana"],
                ["Serving", "Indiana National Guard · United States Air Force"],
                ["Photographs", "Weddings, engagements, save the dates"],
                ["Also", "Families, newborns, proposals"],
                ["Business", "Military-owned"],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[110px_1fr] gap-3 border-t border-line pt-3">
                  <dt className="caps text-[0.58rem] text-ink-faint pt-1">{k}</dt>
                  <dd className="text-sm">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Container>

      {strip.length > 0 ? (
        <div className="mt-16 px-1 sm:px-2">
          <JustifiedGrid
            items={strip.map((p) => ({
              key: p.id,
              ratio: p.cover!.width / p.cover!.height,
              href: projectHref(p),
              tone: p.cover!.dominant_color,
              ariaLabel: p.title,
              render: (sizes) => (
                <Image
                  src={photoUrl(p.cover!.web_path)}
                  alt={p.cover!.alt ?? p.title}
                  fill
                  sizes={sizes}
                  quality={75}
                  placeholder={p.cover!.blur_data_url ? "blur" : "empty"}
                  blurDataURL={p.cover!.blur_data_url ?? undefined}
                />
              ),
            }))}
          />
        </div>
      ) : null}

      <Container className="mt-20 sm:mt-28">
        <SectionHeading title="What you get" />
        <ol className="mt-10 grid gap-px overflow-hidden rounded-xs border border-sage bg-line md:grid-cols-3">
          {PRINCIPLES.map((p, i) => (
            <li key={p.title} className="bg-paper p-7">
              <span className="display text-4xl text-sage">0{i + 1}</span>
              <h3 className="mt-3 display text-3xl">{p.title}</h3>
              <p className="mt-2 text-sm text-ink-soft leading-relaxed">{p.body}</p>
            </li>
          ))}
        </ol>
      </Container>

      <Container className="mt-12">
        <p className="text-sm text-ink-soft">
          Dani also photographs for businesses and the military.{" "}
          <Link href="/portfolio" className="underline underline-offset-4 decoration-sage hover:text-ink">See all of her work</Link>, or{" "}
          <InquiryButton kind="retainer" variant="link" className="text-sm">ask about business photography</InquiryButton>.
        </p>
      </Container>

      <div className="mt-16">
        <CtaBand />
      </div>
    </>
  );
}
