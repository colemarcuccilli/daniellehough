import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ height = 28, className, priority }: { height?: number; className?: string; priority?: boolean }) {
  const width = Math.round((height * 153) / 240);
  return (
    <Image
      src="/brand/logo-mark.png"
      alt=""
      aria-hidden
      width={width}
      height={height}
      priority={priority}
      className={cn("select-none", className)}
    />
  );
}

/** Letter-spaced serif caps, like the stationery. */
export function Wordmark({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  return (
    <span className={cn("wordmark text-[1.02rem]", tone === "dark" ? "text-cream" : "text-sage-deep", className)}>
      Dani Cams
    </span>
  );
}

export function BrandLink({
  className,
  tone = "light",
  subtitle = true,
}: {
  className?: string;
  tone?: "light" | "dark";
  subtitle?: boolean;
}) {
  const dark = tone === "dark";
  return (
    <Link href="/" aria-label="Dani Cams home" className={cn("group inline-flex items-center gap-3", className)}>
      <span
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-transform duration-300 group-hover:-rotate-6",
          dark ? "border-cream/40 bg-cream" : "border-line-strong bg-paper",
        )}
      >
        <LogoMark height={22} priority />
      </span>
      <span className="flex items-center gap-3">
        <Wordmark tone={tone} className="hidden sm:inline" />
        {subtitle ? (
          <>
            <span aria-hidden className={cn("hidden h-5 w-px lg:block", dark ? "bg-cream/40" : "bg-line-strong")} />
            <span className={cn("caps hidden text-[0.56rem] tracking-[0.3em] lg:inline", dark ? "text-cream/70" : "text-ink-soft")}>
              Danielle Hough, Photographer
            </span>
          </>
        ) : null}
      </span>
    </Link>
  );
}
