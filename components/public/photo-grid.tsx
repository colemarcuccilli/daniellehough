"use client";

import { useCallback, useMemo, useState, type CSSProperties } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Counter from "yet-another-react-lightbox/plugins/counter";
import "yet-another-react-lightbox/plugins/captions.css";
import "yet-another-react-lightbox/plugins/counter.css";
import { optimizedUrl, photoUrl } from "@/lib/images";
import { ROW_TARGETS, layoutRows, sizesFor, tileFraction } from "@/lib/rows";
import { cn } from "@/lib/utils";

export type GridPhoto = {
  id: string;
  web_path: string;
  width: number;
  height: number;
  alt: string | null;
  caption?: string | null;
  blur_data_url?: string | null;
  dominant_color?: string | null;
  /** Optional small label rendered on hover (e.g. project title on category pages). */
  label?: string | null;
};

const LIGHTBOX_WIDTHS = [828, 1200, 1920, 2048];

export function PhotoGrid({
  photos,
  className,
  targets = ROW_TARGETS,
  priorityCount = 3,
}: {
  photos: GridPhoto[];
  className?: string;
  targets?: { mobile: number; desktop: number };
  priorityCount?: number;
}) {
  const [index, setIndex] = useState(-1);

  const slides = useMemo(
    () =>
      photos.map((p) => {
        const ratio = p.width / p.height;
        return {
          src: optimizedUrl(p.web_path, 2048, 85),
          alt: p.alt ?? "",
          width: p.width,
          height: p.height,
          description: p.caption ?? undefined,
          srcSet: LIGHTBOX_WIDTHS.map((w) => ({
            src: optimizedUrl(p.web_path, w, 85),
            width: w,
            height: Math.round(w / ratio),
          })),
          download: photoUrl(p.web_path),
        };
      }),
    [photos],
  );

  const close = useCallback(() => setIndex(-1), []);

  if (photos.length === 0) return null;

  return (
    <>
      <div className={className}>
        <Rows photos={photos} target={targets.mobile} className="md:hidden" onOpen={setIndex} priorityCount={0} />
        <Rows photos={photos} target={targets.desktop} className="hidden md:flex" onOpen={setIndex} priorityCount={priorityCount} />
      </div>

      <Lightbox
        open={index >= 0}
        index={index}
        close={close}
        slides={slides}
        plugins={[Zoom, Captions, Counter]}
        zoom={{ maxZoomPixelRatio: 2, scrollToZoom: true }}
        captions={{ descriptionTextAlign: "center" }}
        counter={{ container: { style: { top: "unset", bottom: 0, fontFamily: "var(--font-mono)", fontSize: 12 } } }}
        carousel={{ finite: false, preload: 2, padding: "24px" }}
        controller={{ closeOnBackdropClick: true }}
        animation={{ fade: 200, swipe: 300 }}
        styles={{ container: { backgroundColor: "rgba(27,29,30,0.96)" } }}
      />
    </>
  );
}

function Rows({
  photos,
  target,
  className,
  onOpen,
  priorityCount,
}: {
  photos: GridPhoto[];
  target: number;
  className?: string;
  onOpen: (i: number) => void;
  priorityCount: number;
}) {
  const layout = useMemo(() => layoutRows(photos.map((p) => ({ item: p, ratio: p.width / p.height })), target), [photos, target]);
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {layout.rows.map((row, ri) => {
        const short = layout.shortLast && ri === layout.rows.length - 1;
        return (
          <div key={ri} className="flex gap-1">
            {row.map(({ item: p, ratio, index }) => {
              const fraction = tileFraction(row, ratio, target, short);
              const style: Record<string, string | undefined> = {
                aspectRatio: String(ratio),
                "--tone": p.dominant_color ?? undefined,
                ...(short
                  ? { flex: "none", width: `calc(${(fraction * 100).toFixed(3)}% - ${(4 * (row.length - 1)) / row.length}px)` }
                  : { flex: `${ratio} 1 0%` }),
              };
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onOpen(index)}
                  className="tile group cursor-zoom-in text-left"
                  style={style as CSSProperties}
                  aria-label={p.alt ? `Open ${p.alt}` : "Open photo"}
                >
                  <Image
                    src={photoUrl(p.web_path)}
                    alt={p.alt ?? ""}
                    fill
                    sizes={sizesFor(fraction)}
                    quality={75}
                    placeholder={p.blur_data_url ? "blur" : "empty"}
                    blurDataURL={p.blur_data_url ?? undefined}
                    priority={index < priorityCount}
                  />
                  {p.label ? (
                    <span className="pointer-events-none absolute left-2 bottom-2 rounded-xs bg-ink/80 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-cream opacity-0 transition-opacity group-hover:opacity-100">
                      {p.label}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
