import { Container } from "@/components/public/section";
import { cn } from "@/lib/utils";

/** Dark masthead for inner pages, so the transparent nav always sits on ink. */
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
    <section className={cn("bg-ink text-cream pt-24 pb-10 sm:pt-32 sm:pb-14", className)}>
      <Container>
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div>
            {eyebrow ? <p className="eyebrow mb-4 text-cream/70 [&::before]:bg-marigold">{eyebrow}</p> : null}
            <h1 className="display text-5xl sm:text-7xl lg:text-8xl">{title}</h1>
            {body ? <p className="mt-5 max-w-2xl text-lg text-cream/80 leading-relaxed">{body}</p> : null}
          </div>
          {aside ? <div className="lg:justify-self-end lg:text-right">{aside}</div> : null}
        </div>
        {children ? <div className="mt-8">{children}</div> : null}
      </Container>
    </section>
  );
}
