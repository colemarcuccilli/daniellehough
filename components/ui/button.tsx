import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
  {
    variants: {
      variant: {
        primary:
          "bg-ink text-bg hover:bg-ink-soft active:scale-[0.98]",
        marigold:
          "bg-marigold text-ink hover:bg-marigold-bright shadow-[0_4px_0_0_var(--color-marigold-deep)] hover:shadow-[0_2px_0_0_var(--color-marigold-deep)] active:translate-y-[2px] active:shadow-none",
        outline:
          "border border-ink/20 bg-bg hover:bg-cream hover:border-ink/40 text-ink",
        ghost:
          "text-ink hover:bg-cream",
        link: "text-ink underline-offset-4 hover:underline",
        danger:
          "bg-terracotta text-bg hover:bg-terracotta/90",
      },
      size: {
        sm: "h-8 px-3 text-sm rounded-md",
        md: "h-10 px-4 text-sm rounded-lg",
        lg: "h-12 px-6 text-base rounded-xl",
        xl: "h-14 px-8 text-lg rounded-2xl",
        icon: "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonStyles>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonStyles({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";
