"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Counter from "yet-another-react-lightbox/plugins/counter";
import "yet-another-react-lightbox/plugins/counter.css";
import { Check, CheckSquare, Download, Loader2, Share, Square, X } from "lucide-react";
import { toast } from "sonner";
import { downloadZip } from "client-zip";
import { optimizedUrl, photoUrl, slugify } from "@/lib/images";
import { downloadPath } from "@/lib/gallery";
import { layoutColumns } from "@/lib/masonry";
import { pluralize } from "@/lib/utils";
import { cn } from "@/lib/utils";

export type GalleryPhoto = {
  id: string;
  web_path: string;
  width: number;
  height: number;
  alt: string | null;
  blur_data_url?: string | null;
  dominant_color?: string | null;
};

export type GalleryViewSection = { id: string; slug: string; name: string; photos: GalleryPhoto[] };

const LIGHTBOX_WIDTHS = [828, 1200, 1920, 2048];
const COLUMNS = { phone: 2, desktop: 3 } as const;
const SIZES = "(min-width: 1400px) 460px, (min-width: 768px) 33vw, 50vw";

declare global {
  interface Window {
    showSaveFilePicker?: (opts?: {
      suggestedName?: string;
      types?: { description?: string; accept: Record<string, string[]> }[];
    }) => Promise<{ createWritable: () => Promise<WritableStream> }>;
  }
}

type Zip = { done: number; total: number };
/** Save-to-Photos progress for the photo open in the viewer. */
type Share = { id: string; state: "loading" | "needs-tap"; pct: number };
const PREFETCH_DELAY_MS = 500;
const FILE_CACHE_MAX = 4;

/** Streams a gallery original into a File, reporting progress 0–99. */
async function fetchOriginal(slug: string, p: GalleryPhoto, onProgress: (pct: number) => void, signal?: AbortSignal): Promise<File> {
  const meta = (await fetch(`${downloadPath(slug, p.id)}?format=json`, { signal }).then((r) => (r.ok ? r.json() : null))) as
    | { url: string; filename: string }
    | null;
  if (!meta) throw new Error("Could not prepare the photo.");
  const res = await fetch(meta.url, { signal });
  if (!res.ok || !res.body) throw new Error("Could not fetch the photo.");
  const total = Number(res.headers.get("content-length") || 0);
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let got = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    got += value.byteLength;
    if (total) onProgress(Math.min(99, Math.round((got / total) * 100)));
  }
  return new File(chunks as BlobPart[], meta.filename, { type: "image/jpeg" });
}

let canShareCache: boolean | null = null;
function canShareFilesNow() {
  if (canShareCache !== null) return canShareCache;
  try {
    const probe = new File([new Uint8Array(1)], "probe.jpg", { type: "image/jpeg" });
    canShareCache = !!navigator.canShare && navigator.canShare({ files: [probe] }) && window.matchMedia("(hover: none)").matches;
  } catch {
    canShareCache = false;
  }
  return canShareCache;
}
const noSubscribe = () => () => {};
/** True on touch devices whose share sheet accepts files (iOS Safari, Android Chrome). */
function useCanShareFiles() {
  return useSyncExternalStore(noSubscribe, canShareFilesNow, () => false);
}

/** Which section is under the sticky bar right now. */
function useActiveSection(slugs: string[]) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const line = 96; // just under the sticky bar
      let current: string | null = null;
      for (const slug of slugs) {
        const el = document.getElementById(`s-${slug}`);
        if (el && el.getBoundingClientRect().top <= line) current = slug;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [slugs]);
  return active;
}

export function GalleryView({
  slug,
  title,
  sections,
  downloads,
}: {
  slug: string;
  title: string;
  sections: GalleryViewSection[];
  downloads: boolean;
}) {
  const flat = useMemo(() => sections.flatMap((s) => s.photos), [sections]);
  const offsets = useMemo(() => {
    const map = new Map<string, number>();
    let n = 0;
    for (const s of sections) {
      map.set(s.id, n);
      n += s.photos.length;
    }
    return map;
  }, [sections]);

  const [index, setIndex] = useState(-1);
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [zip, setZip] = useState<Zip | null>(null);
  const [share, setShare] = useState<Share | null>(null);
  const canShareFiles = useCanShareFiles();
  const fileCache = useRef(new Map<string, File>());
  const inflight = useRef<{ id: string; promise: Promise<File>; controller: AbortController } | null>(null);
  const slugs = useMemo(() => sections.map((s) => s.slug), [sections]);
  const active = useActiveSection(slugs);
  const navRef = useRef<HTMLElement>(null);

  // Keep the highlighted chip in view as the page scrolls through sections.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav || !active) return;
    const chip = nav.querySelector<HTMLElement>(`[data-chip="${active}"]`);
    if (!chip) return;
    const left = chip.offsetLeft - 12;
    if (left < nav.scrollLeft || chip.offsetLeft + chip.offsetWidth > nav.scrollLeft + nav.clientWidth) nav.scrollTo({ left, behavior: "smooth" });
  }, [active]);

  /**
   * Phones: the share sheet's "Save Image" is the only way into Photos, and
   * it must open on the tap itself. So the original starts loading as soon as
   * a photo is open in the viewer; by the time someone taps Save it is usually
   * in memory and the sheet opens at once. If they tap first, a big
   * "Save to Photos" button appears when the file is ready.
   */
  const startFetch = useCallback(
    (p: GalleryPhoto) => {
      if (inflight.current?.id === p.id) return inflight.current.promise;
      inflight.current?.controller.abort();
      const controller = new AbortController();
      const promise = fetchOriginal(slug, p, (pct) => setShare((cur) => (cur?.id === p.id && cur.state === "loading" ? { ...cur, pct } : cur)), controller.signal)
        .then((file) => {
          fileCache.current.set(p.id, file);
          if (fileCache.current.size > FILE_CACHE_MAX) fileCache.current.delete(fileCache.current.keys().next().value as string);
          return file;
        })
        .finally(() => {
          if (inflight.current?.id === p.id) inflight.current = null;
        });
      inflight.current = { id: p.id, promise, controller };
      return promise;
    },
    [slug],
  );

  // Warm the file for the photo being viewed (after a short pause so swiping doesn't fetch everything).
  useEffect(() => {
    if (!canShareFiles || !downloads || index < 0) return;
    const p = flat[index];
    if (!p || fileCache.current.has(p.id)) return;
    const t = setTimeout(() => {
      startFetch(p).catch(() => {});
    }, PREFETCH_DELAY_MS);
    return () => clearTimeout(t);
  }, [index, flat, canShareFiles, downloads, startFetch]);

  const presentShare = async (p: GalleryPhoto, file: File) => {
    try {
      await navigator.share({ files: [file] });
      setShare(null);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        setShare(null); // sheet dismissed
        return;
      }
      if (e instanceof DOMException && e.name === "NotAllowedError") {
        setShare({ id: p.id, state: "needs-tap", pct: 100 }); // the tap expired while loading: ask for one more
        return;
      }
      setShare(null);
      toast.error("Could not open the share sheet.");
    }
  };

  const saveToPhotos = async (p: GalleryPhoto) => {
    const cached = fileCache.current.get(p.id);
    if (cached) {
      await presentShare(p, cached); // still inside the tap: the sheet opens immediately
      return;
    }
    if (share?.id === p.id && share.state === "loading") return;
    setShare({ id: p.id, state: "loading", pct: 0 });
    try {
      const file = await startFetch(p);
      await presentShare(p, file);
    } catch (e) {
      setShare(null);
      if (e instanceof DOMException && e.name === "AbortError") return;
      toast.error(e instanceof Error ? e.message : "Could not save the photo.");
    }
  };

  const slides = useMemo(
    () =>
      flat.map((p) => {
        const ratio = p.width / p.height;
        return {
          src: optimizedUrl(p.web_path, 2048, 85),
          alt: p.alt ?? "",
          width: p.width,
          height: p.height,
          srcSet: LIGHTBOX_WIDTHS.map((w) => ({ src: optimizedUrl(p.web_path, w, 85), width: w, height: Math.round(w / ratio) })),
        };
      }),
    [flat],
  );

  const toggle = useCallback((id: string) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectSection = (s: GalleryViewSection, on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      for (const p of s.photos) if (on) next.add(p.id);
      else next.delete(p.id);
      return next;
    });

  const stopSelecting = () => {
    setSelecting(false);
    setSelected(new Set());
  };

  const downloadSelected = async () => {
    const chosen = flat.filter((p) => selected.has(p.id));
    if (chosen.length === 0 || zip) return;
    const zipName = `${slugify(title) || "photos"}.zip`;

    // Ask where to save first (needs the click's user activation), then stream.
    let writable: WritableStream | null = null;
    if (window.showSaveFilePicker) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: zipName,
          types: [{ description: "Zip archive", accept: { "application/zip": [".zip"] } }],
        });
        writable = await handle.createWritable();
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        writable = null; // fall back to a blob download
      }
    }

    setZip({ done: 0, total: chosen.length });
    let count = 0;
    async function* files() {
      for (const p of chosen) {
        const meta = (await fetch(`${downloadPath(slug, p.id)}?format=json`).then((r) => (r.ok ? r.json() : null))) as
          | { url: string; filename: string }
          | null;
        if (!meta) throw new Error("A photo could not be prepared for download.");
        const res = await fetch(meta.url);
        if (!res.ok || !res.body) throw new Error(`Could not fetch ${meta.filename}.`);
        yield { name: meta.filename, input: res, lastModified: new Date() };
        count++;
        setZip({ done: count, total: chosen.length });
      }
    }

    try {
      const response = downloadZip(files());
      if (writable) {
        await response.body!.pipeTo(writable);
      } else {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = zipName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      }
      toast.success(`${pluralize(chosen.length, "photo")} zipped`);
      stopSelecting();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Download failed. Try fewer photos at once.");
    } finally {
      setZip(null);
    }
  };

  // "Stuck" once the stacked index has scrolled above the viewport.
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setStuck(!entry.isIntersecting && entry.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const controls = downloads ? (
    <div className="hidden shrink-0 items-center gap-2 md:flex">
      {selecting ? (
        <>
          <span className="caps text-[0.62rem] text-ink-soft">{zip ? `Preparing ${zip.done} / ${zip.total}` : `${selected.size} selected`}</span>
          <button
            type="button"
            onClick={downloadSelected}
            disabled={selected.size === 0 || !!zip}
            className="caps inline-flex h-8 items-center gap-1.5 rounded-xs border border-ink bg-marigold px-3 text-[0.62rem] text-ink transition-colors hover:bg-marigold-bright disabled:pointer-events-none disabled:opacity-40"
          >
            {zip ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
            Download zip
          </button>
          <button
            type="button"
            onClick={stopSelecting}
            disabled={!!zip}
            aria-label="Stop selecting"
            className="inline-flex h-8 w-8 items-center justify-center rounded-xs border border-line-strong text-ink-soft hover:border-ink hover:text-ink disabled:opacity-40"
          >
            <X size={14} />
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setSelecting(true)}
          className="caps inline-flex h-8 items-center gap-1.5 rounded-xs border border-ink/70 px-3 text-[0.62rem] text-ink transition-colors hover:bg-cream"
        >
          <CheckSquare size={13} /> Select photos
        </button>
      )}
    </div>
  ) : null;

  const close = useCallback(() => setIndex(-1), []);
  const current = index >= 0 ? flat[index] : null;
  // Share state is keyed by photo id, so moving to another photo simply hides it.
  const needsTap = !!(share && current && share.id === current.id && share.state === "needs-tap");

  return (
    <>
      {/* Full index at the top of the page: every section, stacked. */}
      <div className="mx-auto max-w-[1400px] px-4 pt-6 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
          <nav aria-label="Sections" className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#s-${s.slug}`}
                className="caps inline-flex items-center justify-between gap-3 rounded-xs border border-line-strong px-3.5 py-2.5 text-[0.64rem] text-ink transition-colors hover:border-sage-deep hover:bg-sage-deep hover:text-cream"
              >
                <span className="truncate">{s.name}</span>
                <span className="text-ink-faint">{s.photos.length}</span>
              </a>
            ))}
          </nav>
          {controls}
        </div>
      </div>
      <div ref={sentinelRef} aria-hidden className="h-px" />

      {/* Slim one-row bar, fixed to the top once the index has scrolled away. */}
      <div
        className={cn(
          "fixed inset-x-0 top-0 z-30 border-b border-line bg-bg/92 backdrop-blur-md transition-transform duration-200",
          stuck ? "translate-y-0" : "pointer-events-none -translate-y-full",
        )}
        aria-hidden={!stuck}
      >
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 sm:px-6">
          <nav ref={navRef} aria-label="Sections" className="-mx-1 flex min-w-0 flex-1 gap-1 overflow-x-auto py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {sections.map((s) => {
              const on = active === s.slug;
              return (
                <a
                  key={s.id}
                  href={`#s-${s.slug}`}
                  data-chip={s.slug}
                  aria-current={on ? "location" : undefined}
                  tabIndex={stuck ? undefined : -1}
                  className={cn(
                    "caps shrink-0 whitespace-nowrap rounded-xs border px-3 py-1.5 text-[0.62rem] transition-colors",
                    on ? "border-sage-deep bg-sage-deep text-cream" : "border-transparent text-ink-soft hover:border-sage hover:text-ink",
                  )}
                >
                  {s.name}
                  <span className={cn("ml-1.5", on ? "text-cream/70" : "text-ink-faint")}>{s.photos.length}</span>
                </a>
              );
            })}
          </nav>
          {controls}
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-1 sm:px-2">
        {sections.map((s) => {
          const base = offsets.get(s.id) ?? 0;
          const allOn = s.photos.every((p) => selected.has(p.id));
          return (
            <section key={s.id} id={`s-${s.slug}`} className="scroll-mt-16 pt-12 first:pt-8">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3 px-3 sm:px-4">
                <div>
                  <h2 className="display text-4xl sm:text-5xl">{s.name}</h2>
                  <p className="caps mt-2 text-[0.6rem] text-ink-faint">{pluralize(s.photos.length, "photograph")}</p>
                </div>
                {selecting ? (
                  <button
                    type="button"
                    onClick={() => selectSection(s, !allOn)}
                    className="caps inline-flex items-center gap-1.5 border-b border-sage pb-0.5 text-[0.62rem] text-ink hover:text-marigold-deep"
                  >
                    {allOn ? <CheckSquare size={13} /> : <Square size={13} />}
                    {allOn ? "Clear section" : "Select section"}
                  </button>
                ) : null}
              </div>
              <Columns
                photos={s.photos}
                columns={COLUMNS.phone}
                className="md:hidden"
                base={base}
                slug={slug}
                downloads={downloads}
                selecting={selecting}
                selected={selected}
                onOpen={setIndex}
                onToggle={toggle}
                priorityCount={base === 0 ? 2 : 0}
              />
              <Columns
                photos={s.photos}
                columns={COLUMNS.desktop}
                className="hidden md:flex"
                base={base}
                slug={slug}
                downloads={downloads}
                selecting={selecting}
                selected={selected}
                onOpen={setIndex}
                onToggle={toggle}
                priorityCount={base === 0 ? 3 : 0}
              />
            </section>
          );
        })}
      </div>

      <Lightbox
        open={index >= 0}
        index={index}
        close={close}
        slides={slides}
        on={{ view: ({ index: i }) => setIndex(i) }}
        plugins={[Zoom, Counter]}
        zoom={{ maxZoomPixelRatio: 2, scrollToZoom: true }}
        counter={{ container: { style: { top: "unset", bottom: 0, fontFamily: "var(--font-sans)", fontSize: 12, letterSpacing: "0.16em" } } }}
        carousel={{ finite: false, preload: 2, padding: "16px" }}
        controller={{ closeOnBackdropClick: true }}
        animation={{ fade: 200, swipe: 300 }}
        toolbar={{
          buttons: [
            downloads && current && canShareFiles ? (
              <button
                key="save"
                type="button"
                onClick={() => void saveToPhotos(current)}
                disabled={share?.id === current.id && share.state === "loading"}
                aria-label="Save to Photos"
                className="caps my-2 mr-1 inline-flex h-9 items-center gap-2 rounded-full border border-cream/70 bg-ink/40 px-4 text-[0.62rem] text-cream backdrop-blur disabled:opacity-80"
              >
                {share?.id === current.id && share.state === "loading" ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Loading {share.pct}%
                  </>
                ) : (
                  <>
                    <Download size={15} /> Save to Photos
                  </>
                )}
              </button>
            ) : downloads && current ? (
              <a
                key="download"
                className="yarl__button"
                href={downloadPath(slug, current.id)}
                download
                title="Download full-size photo"
                aria-label="Download full-size photo"
              >
                <Download size={22} />
              </a>
            ) : null,
            "close",
          ],
        }}
        styles={{ container: { backgroundColor: "rgba(35,40,35,0.97)" } }}
      />

      {needsTap && current ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[10000] flex justify-center px-6">
          <button
            type="button"
            onClick={() => {
              const file = fileCache.current.get(current.id);
              if (file) void presentShare(current, file);
            }}
            className="caps pointer-events-auto inline-flex h-14 items-center gap-3 rounded-full border border-ink bg-marigold px-8 text-[0.72rem] text-ink shadow-soft"
          >
            <Share size={18} /> Save to Photos
          </button>
        </div>
      ) : null}
    </>
  );
}

function Columns({
  photos,
  columns,
  className,
  base,
  slug,
  downloads,
  selecting,
  selected,
  onOpen,
  onToggle,
  priorityCount,
}: {
  photos: GalleryPhoto[];
  columns: number;
  className?: string;
  base: number;
  slug: string;
  downloads: boolean;
  selecting: boolean;
  selected: Set<string>;
  onOpen: (i: number) => void;
  onToggle: (id: string) => void;
  priorityCount: number;
}) {
  const cols = useMemo(() => layoutColumns(photos.map((p) => ({ item: p, ratio: p.width / p.height })), columns), [photos, columns]);
  return (
    <div className={cn("flex gap-1", className)}>
      {cols.map((col, ci) => (
        <div key={ci} className="flex min-w-0 flex-1 flex-col gap-1">
          {col.map(({ item: p, ratio, index }) => {
            const on = selected.has(p.id);
            const style = { aspectRatio: String(ratio), "--tone": p.dominant_color ?? undefined } as CSSProperties;
            return (
              <div key={p.id} className={cn("tile group", selecting && on && "outline-2 outline-marigold")} style={style}>
                <button
                  type="button"
                  onClick={() => (selecting ? onToggle(p.id) : onOpen(base + index))}
                  className={cn("absolute inset-0 block h-full w-full text-left", selecting ? "cursor-pointer" : "cursor-zoom-in")}
                  aria-label={selecting ? (on ? "Deselect photo" : "Select photo") : p.alt ? `Open ${p.alt}` : "Open photo"}
                  aria-pressed={selecting ? on : undefined}
                >
                  <Image
                    src={photoUrl(p.web_path)}
                    alt={p.alt ?? ""}
                    fill
                    sizes={SIZES}
                    quality={75}
                    placeholder={p.blur_data_url ? "blur" : "empty"}
                    blurDataURL={p.blur_data_url ?? undefined}
                    priority={index < priorityCount}
                    className={cn(selecting && on && "opacity-80")}
                  />
                </button>
                {selecting ? (
                  <span
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full border transition-colors",
                      on ? "border-marigold bg-marigold text-ink" : "border-cream/80 bg-ink/40 text-cream",
                    )}
                  >
                    {on ? <Check size={15} /> : null}
                  </span>
                ) : downloads ? (
                  <a
                    href={downloadPath(slug, p.id)}
                    download
                    onClick={(e) => e.stopPropagation()}
                    title="Download full-size photo"
                    aria-label="Download full-size photo"
                    className="absolute bottom-2 right-2 hidden h-9 w-9 place-items-center rounded-full border border-cream/70 bg-ink/55 text-cream opacity-0 backdrop-blur transition-opacity hover:bg-marigold hover:text-ink hover:border-marigold group-hover:opacity-100 focus-visible:opacity-100 md:grid"
                  >
                    <Download size={15} />
                  </a>
                ) : null}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
