import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap select-none font-sans font-medium uppercase tracking-[0.16em] transition-colors duration-200 disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
  {
    variants: {
      variant: {
        primary: "bg-marigold text-ink border border-ink/80 hover:bg-marigold-bright",
        ink: "bg-ink text-cream border border-ink hover:bg-sage-deep hover:border-sage-deep",
        sage: "bg-sage-deep text-cream border border-sage-deep hover:bg-sage hover:border-sage",
        outline: "bg-transparent text-ink border border-ink/70 hover:border-ink hover:bg-cream",
        soft: "bg-cream text-ink border border-line-strong hover:border-sage",
        ghost: "text-ink-soft hover:text-ink hover:bg-cream border border-transparent",
        danger: "bg-transparent text-coral border border-coral hover:bg-coral hover:text-paper",
        link: "normal-case tracking-normal font-normal text-ink underline underline-offset-4 decoration-marigold-deep hover:decoration-ink px-0 h-auto",
        pill: "rounded-full bg-marigold text-ink border border-marigold hover:bg-marigold-bright",
        cream: "bg-transparent text-cream border border-cream/70 hover:bg-cream hover:text-ink",
      },
      size: {
        xs: "h-7 px-2.5 text-[10px] rounded-xs",
        sm: "h-8 px-3.5 text-[10.5px] rounded-xs",
        md: "h-10 px-5 text-[11px] rounded-xs",
        lg: "h-12 px-7 text-[12px] rounded-xs",
        icon: "h-9 w-9 rounded-xs",
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
