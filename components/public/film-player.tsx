"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { filmEmbed, filmPoster, type Film } from "@/lib/content";
import { cn } from "@/lib/utils";

/** Poster first; the Cloudflare Stream player loads only after a click. */
export function FilmPlayer({ film, className }: { film: Film; className?: string }) {
  const [playing, setPlaying] = useState(false);
  return (
    <figure className={className}>
      <div className={cn("relative overflow-hidden rounded-xs bg-black", film.vertical ? "aspect-[9/16]" : "aspect-video")}>
        {playing ? (
          <iframe
            src={filmEmbed(film)}
            title={film.title}
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <button type="button" onClick={() => setPlaying(true)} aria-label={`Play ${film.title}`} className="group absolute inset-0 block h-full w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={filmPoster(film)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
            <span className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/10" aria-hidden />
            <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-cream/80 bg-black/30 text-cream backdrop-blur-sm transition-colors group-hover:bg-marigold group-hover:text-ink group-hover:border-marigold">
              <Play size={20} className="translate-x-0.5" fill="currentColor" />
            </span>
          </button>
        )}
      </div>
      <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="display text-2xl sm:text-3xl">{film.title}</span>
        <span className="caps text-[0.58rem] text-marigold">{film.label}</span>
        <span className="w-full text-sm opacity-70">{film.note}</span>
      </figcaption>
    </figure>
  );
}
