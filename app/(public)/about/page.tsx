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
  description: "Danielle Nicole Hough is an Indiana photographer and a current member of the Indiana National Guard and the United States Air Force.",
};

const PRINCIPLES = [
  { title: "Show up ready", body: "Shot list built, gear checked, plan for the light." },
  { title: "Consistent", body: "Every gallery edited to the same standard, so your library matches." },
  { title: "On time", body: "You get a delivery date and the files on it." },
];

export default async function AboutPage() {
  const projects = await getProjects({ featuredOnly: true });
  const strip = projects.filter((p) => p.cover).slice(0, 5);

  return (
    <>
      <PageHeader
        eyebrow="Dani Cams"
        title="Danielle Nicole Hough"
        body="Photographer, based in Indiana. Current member of the Indiana National Guard and the United States Air Force."
      />

      <Container className="mt-12 sm:mt-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-start">
          <div>
            <div className="prose-basic text-lg text-ink-soft leading-relaxed max-w-xl">
              <p>
                Most of my hours behind a camera have been on the flight line: airmen, aircraft, ceremonies. That work runs on
                a schedule, in whatever light there is, with no do-overs. Dani Cams runs the same way, for businesses and for
                families.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <InquiryButton variant="primary" size="lg">Start a project</InquiryButton>
              <Link href="/portfolio" className={buttonStyles({ variant: "outline", size: "lg" })}>
                Portfolio
              </Link>
            </div>
          </div>
          <div className="outline-card p-8 sm:p-10 lg:justify-self-end w-full max-w-md">
            <LogoMark height={110} />
            <dl className="mt-8 grid gap-4">
              {[
                ["Based in", "Indiana"],
                ["Serving", "Indiana National Guard · United States Air Force"],
                ["For businesses", "Quarterly and monthly photography"],
                ["Also", "Headshot days, events, families, proposals"],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[110px_1fr] gap-3 border-t border-line pt-3">
                  <dt className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-faint pt-1">{k}</dt>
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
        <SectionHeading eyebrow="How I work" title="Three things you can count on" />
        <ol className="mt-10 grid gap-px bg-ink border border-ink rounded-md overflow-hidden md:grid-cols-3">
          {PRINCIPLES.map((p, i) => (
            <li key={p.title} className="bg-paper p-7">
              <span className="display text-3xl" style={{ color: ["var(--color-teal)", "var(--color-purple)", "var(--color-green)"][i] }}>0{i + 1}</span>
              <h3 className="mt-3 display text-2xl">{p.title}</h3>
              <p className="mt-2 text-sm text-ink-soft leading-relaxed">{p.body}</p>
            </li>
          ))}
        </ol>
      </Container>

      <div className="mt-24">
        <CtaBand />
      </div>
    </>
  );
}
