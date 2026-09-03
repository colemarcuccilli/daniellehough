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

export function Wordmark({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  return (
    <span className={cn("display text-[1.3rem] tracking-[-0.03em]", tone === "dark" ? "text-cream" : "text-ink", className)}>
      Dani<span className="text-marigold">Cams</span>
    </span>
  );
}

export function BrandLink({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  return (
    <Link href="/" aria-label="Dani Cams home" className={cn("group inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "grid h-9 w-9 place-items-center rounded-full transition-transform duration-300 group-hover:-rotate-6",
          tone === "dark" ? "bg-cream" : "bg-marigold-glow",
        )}
      >
        <LogoMark height={22} priority />
      </span>
      <Wordmark tone={tone} className="hidden sm:inline" />
    </Link>
  );
}
