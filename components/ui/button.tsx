import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap select-none transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
  {
    variants: {
      variant: {
        primary:
          "bg-marigold text-ink border border-ink shadow-hard hover:bg-marigold-bright hover:-translate-y-px active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
        ink: "bg-ink text-cream border border-ink hover:bg-slate-deep",
        outline:
          "bg-transparent text-ink border border-ink hover:bg-marigold-glow active:bg-marigold/40",
        soft: "bg-cream text-ink border border-line-strong hover:border-ink",
        ghost: "text-ink-soft hover:text-ink hover:bg-cream border border-transparent",
        danger: "bg-transparent text-coral border border-coral hover:bg-coral hover:text-paper",
        link: "text-ink underline underline-offset-4 decoration-marigold-deep hover:decoration-ink px-0 h-auto",
      },
      size: {
        xs: "h-7 px-2.5 text-xs rounded-xs",
        sm: "h-8 px-3 text-sm rounded-sm",
        md: "h-10 px-4 text-sm rounded-sm",
        lg: "h-12 px-6 text-base rounded-md",
        icon: "h-9 w-9 rounded-sm",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonStyles>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button ref={ref} type={type} className={cn(buttonStyles({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = "Button";
