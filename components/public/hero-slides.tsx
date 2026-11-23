"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { Photo } from "@/lib/types";
import { photoUrl } from "@/lib/images";
import { cn } from "@/lib/utils";

/** Cross-fading header photos, one per shoot, so no single couple owns the header. */
export function HeroSlides({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState(0);
  const [seen, setSeen] = useState(1);
  useEffect(() => {
    if (photos.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % photos.length);
      setSeen((s) => Math.min(photos.length, s + 1));
    }, 5500);
    return () => clearInterval(t);
  }, [photos.length]);

  return (
    <>
      {photos.map((p, i) =>
        // Later slides mount just before they are needed, so only the first image blocks the page.
        i <= seen ? (
          <Image
            key={p.id}
            src={photoUrl(p.web_path)}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            quality={85}
            placeholder={p.blur_data_url ? "blur" : "empty"}
            blurDataURL={p.blur_data_url ?? undefined}
            className={cn("object-cover object-[center_35%] transition-opacity duration-[1600ms] ease-in-out", i === index ? "opacity-100" : "opacity-0")}
          />
        ) : null,
      )}
    </>
  );
}
