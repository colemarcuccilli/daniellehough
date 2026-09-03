"use client";

import { useEffect, useRef } from "react";

/**
 * Touch devices have no hover, so the band closest to the middle of the
 * viewport gets the hover state (`.is-active`) as the page scrolls. Desktop
 * pointers keep real hover; this does nothing there.
 */
export function BandSpotlight({ id, className, children }: { id?: string; className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || !window.matchMedia("(hover: none)").matches) return;
    const bands = Array.from(root.querySelectorAll<HTMLElement>(".band"));
    if (bands.length === 0) return;
    let raf = 0;
    let current: HTMLElement | null = null;

    const update = () => {
      raf = 0;
      const mid = window.innerHeight / 2;
      let best: HTMLElement | null = null;
      let bestDist = Infinity;
      let currentDist = Infinity;
      for (const band of bands) {
        const r = band.getBoundingClientRect();
        if (r.bottom <= 0 || r.top >= window.innerHeight) continue;
        const d = Math.abs((r.top + r.bottom) / 2 - mid);
        if (band === current) currentDist = d;
        if (d < bestDist) {
          bestDist = d;
          best = band;
        }
      }
      // Keep the current band unless another is clearly closer, so growth doesn't cause flicker.
      const next = current && currentDist <= bestDist + 56 ? current : best;
      if (next !== current) {
        current?.classList.remove("is-active");
        next?.classList.add("is-active");
        current = next;
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
      current?.classList.remove("is-active");
    };
  }, []);

  return (
    <section ref={ref} id={id} className={className}>
      {children}
    </section>
  );
}
