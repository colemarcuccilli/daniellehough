import { Container } from "@/components/public/section";
import { Sprig } from "@/components/public/sprig";
import { cn } from "@/lib/utils";

/** Sage masthead for inner pages, so the transparent nav always sits on a dark ground. */
export function PageHeader({
  eyebrow,
  title,
  body,
  aside,
  children,
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  body?: React.ReactNode;
  aside?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("relative overflow-hidden bg-sage-deep text-cream pt-24 pb-12 sm:pt-32 sm:pb-16", className)}>
      <Sprig className="pointer-events-none absolute -right-8 -top-10 h-56 w-auto text-cream opacity-25 sm:h-80" />
      <Container className="relative">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div>
            {eyebrow ? <p className="eyebrow mb-5 text-cream/70 [&::before]:bg-marigold">{eyebrow}</p> : null}
            <h1 className="display text-6xl sm:text-7xl lg:text-8xl">{title}</h1>
            {body ? <p className="mt-5 max-w-2xl text-lg text-cream/80 leading-relaxed">{body}</p> : null}
          </div>
          {aside ? <div className="lg:justify-self-end lg:text-right">{aside}</div> : null}
        </div>
        {children ? <div className="mt-9">{children}</div> : null}
      </Container>
    </section>
  );
}
