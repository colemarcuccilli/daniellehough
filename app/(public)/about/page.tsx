import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getProjects } from "@/lib/queries";
import { photoUrl } from "@/lib/images";
import { buttonStyles } from "@/components/ui/button";
import { Container, SectionHeading } from "@/components/public/section";
import { JustifiedGrid } from "@/components/public/justified-grid";
import { projectHref } from "@/components/public/project-card";
import { LogoMark } from "@/components/public/logo";
import { CtaBand } from "@/components/public/cta-band";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "About Danielle",
  description:
    "Danielle Nicole Hough is an Indiana photographer and a current member of the Indiana National Guard and the United States Air Force.",
};

const PRINCIPLES = [
  {
    title: "Show up ready",
    body: "Gear checked, shot list built, plan for the light. The day is for making pictures, not for figuring out what we are doing.",
  },
  {
    title: "Consistent, not precious",
    body: "A retainer only works if quarter three looks like quarter one. Every gallery is edited to the same standard so your library actually matches.",
  },
  {
    title: "Deadlines are real",
    body: "Military public affairs does not accept late. Neither does a recruiting campaign or a grand opening. You get a delivery date and you get the files on it.",
  },
];

export default async function AboutPage() {
  const projects = await getProjects({ featuredOnly: true });
  const strip = projects.filter((p) => p.cover).slice(0, 5);

  return (
    <>
      <Container className="pt-14 sm:pt-20">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-start">
          <div>
            <p className="eyebrow mb-4">About</p>
            <h1 className="display text-5xl sm:text-6xl lg:text-7xl">Danielle Nicole Hough</h1>
            <div className="prose-basic mt-8 text-lg text-ink-soft leading-relaxed max-w-xl">
              <p>
                I am a photographer based in Indiana and a current member of the Indiana National Guard and the
                United States Air Force. Most of my hours behind a camera have been spent documenting airmen,
                aircraft, ceremonies, and the work that happens on the flight line.
              </p>
              <p>
                That job teaches a particular discipline: shoot on a schedule, in whatever light the day gives you,
                with no do-overs, and deliver on a deadline. VisionaryHaus is that discipline pointed at businesses
                that need real content on a predictable cadence, and at families who would rather have honest
                pictures than posed ones.
              </p>
              <p>
                The name comes from the light bulb in the logo. The filament is an eye. Seeing the picture before it
                happens is most of the work.
              </p>
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/contact" className={buttonStyles({ variant: "primary", size: "lg" })}>
                Work with me
              </Link>
              <Link href="/portfolio" className={buttonStyles({ variant: "outline", size: "lg" })}>
                See the work
              </Link>
            </div>
          </div>
          <div className="outline-card p-8 sm:p-10 lg:justify-self-end w-full max-w-md">
            <LogoMark height={120} />
            <dl className="mt-8 grid gap-4">
              {[
                ["Based in", "Indiana"],
                ["Serving", "Indiana National Guard · United States Air Force"],
                ["Business focus", "Quarterly & monthly content retainers"],
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
              <span className="display text-3xl text-marigold-deep">0{i + 1}</span>
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
