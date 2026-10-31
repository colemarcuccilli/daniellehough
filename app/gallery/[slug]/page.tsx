import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGalleryBySlug } from "@/lib/queries";
import { photoUrl } from "@/lib/images";
import { formatDate, pluralize } from "@/lib/utils";
import { Wordmark } from "@/components/public/logo";
import { Sprig } from "@/components/public/sprig";
import { GalleryView } from "@/components/gallery/gallery-view";

export const revalidate = 600;

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const g = await getGalleryBySlug(slug);
  if (!g) return { title: "Gallery", robots: { index: false, follow: false } };
  return {
    title: g.title,
    description: g.gallery_intro ?? `${g.title} — photographs by Danielle Hough.`,
    robots: { index: false, follow: false },
    openGraph: g.cover
      ? { title: g.title, images: [{ url: photoUrl(g.cover.web_path), width: g.cover.width, height: g.cover.height }] }
      : undefined,
  };
}

export default async function GalleryPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const g = await getGalleryBySlug(slug);
  if (!g) notFound();

  const line = [g.shot_on ? formatDate(g.shot_on) : null, g.location].filter(Boolean).join(" · ");

  return (
    <>
      <section className="relative isolate flex min-h-[72svh] flex-col overflow-hidden bg-sage-deep text-cream">
        {g.cover ? (
          <Image
            src={photoUrl(g.cover.web_path)}
            alt=""
            fill
            priority
            sizes="100vw"
            quality={75}
            placeholder={g.cover.blur_data_url ? "blur" : "empty"}
            blurDataURL={g.cover.blur_data_url ?? undefined}
            className="object-cover"
            style={{ objectPosition: "center 35%" }}
          />
        ) : null}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(35,40,35,0.86) 0%, rgba(35,40,35,0.35) 45%, rgba(35,40,35,0.25) 100%)",
          }}
        />
        <Sprig className="pointer-events-none absolute -right-8 -top-10 h-56 w-auto text-cream opacity-20 sm:h-72" />

        <div className="relative mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 py-5 sm:px-6">
          <Link href="/" className="inline-flex items-center text-cream hover:text-marigold">
            <Wordmark className="text-[0.95rem]" />
          </Link>
          <span className="caps text-[0.6rem] text-cream/80">Client gallery</span>
        </div>

        <div className="relative mx-auto mt-auto w-full max-w-[1400px] px-4 pb-10 pt-16 sm:px-6 sm:pb-14">
          {line ? <p className="caps mb-4 text-[0.66rem] text-cream/85">{line}</p> : null}
          <h1 className="display text-5xl sm:text-7xl lg:text-8xl">{g.title}</h1>
          {g.gallery_intro ? <p className="mt-5 max-w-2xl text-base leading-relaxed text-cream/85 sm:text-lg">{g.gallery_intro}</p> : null}
          <p className="caps mt-6 text-[0.62rem] text-cream/70">
            {pluralize(g.photos.length, "photograph")}
            {g.gallery_downloads ? " · tap a photo to view it, then use the arrow to save the full-size file" : ""}
          </p>
        </div>
      </section>

      {g.sections.length === 0 ? (
        <div className="mx-auto max-w-xl px-5 py-24 text-center">
          <p className="eyebrow mb-4 justify-center">Coming soon</p>
          <p className="display text-3xl">The photographs are on their way.</p>
          <p className="mt-3 text-ink-soft">Check back shortly — this page fills in as they are added.</p>
        </div>
      ) : null}

      <GalleryView
        slug={slug}
        title={g.title}
        downloads={g.gallery_downloads}
        sections={g.sections.map((s) => ({
          id: s.id,
          slug: s.slug,
          name: s.name,
          photos: s.photos.map((p) => ({
            id: p.id,
            web_path: p.web_path,
            width: p.width,
            height: p.height,
            alt: p.alt,
            blur_data_url: p.blur_data_url,
            dominant_color: p.dominant_color,
          })),
        }))}
      />
    </>
  );
}
