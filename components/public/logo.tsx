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

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("display text-[1.35rem] tracking-tight", className)}>
      Visionary<span className="text-marigold-deep">Haus</span>
    </span>
  );
}

export function BrandLink({ className }: { className?: string }) {
  return (
    <Link href="/" aria-label="VisionaryHaus home" className={cn("group inline-flex items-center gap-2.5", className)}>
      <LogoMark height={30} priority className="transition-transform duration-300 group-hover:-rotate-6" />
      <Wordmark />
    </Link>
  );
}
