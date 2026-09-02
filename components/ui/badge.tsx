import { type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeStyles = cva(
  "inline-flex items-center gap-1.5 rounded-xs px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.14em] leading-5 border",
  {
    variants: {
      tone: {
        cream: "bg-cream text-ink-soft border-line-strong",
        marigold: "bg-marigold text-ink border-ink",
        ink: "bg-ink text-cream border-ink",
        coral: "bg-coral-soft text-coral border-coral/40",
        moss: "bg-moss-soft text-moss border-moss/40",
        slate: "bg-slate-soft text-slate border-slate/30",
        outline: "bg-transparent text-ink border-ink",
      },
    },
    defaultVariants: { tone: "cream" },
  },
);

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeStyles>;

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeStyles({ tone }), className)} {...props} />;
}
