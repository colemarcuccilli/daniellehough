import { FILMS } from "@/lib/content";
import { Container } from "@/components/public/section";
import { FilmPlayer } from "@/components/public/film-player";

/** Plum band: two films with Sweet Dreams beside the vertical social recap. */
export function Films({ id = "films" }: { id?: string }) {
  const wide = FILMS.filter((f) => !f.vertical);
  const tall = FILMS.filter((f) => f.vertical);
  return (
    <section id={id} className="scroll-mt-16 bg-plum py-16 text-cream sm:py-24">
      <Container>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <h2 className="display text-6xl sm:text-7xl lg:text-8xl">Films</h2>
          <p className="caps text-[0.62rem] text-cream/60">Wedding film · Save-the-date film · Social recap</p>
        </div>
        <div className="grid gap-8 lg:grid-cols-[2fr_0.86fr] lg:gap-10">
          <div className="grid gap-8">
            {wide.map((f) => (
              <FilmPlayer key={f.id} film={f} />
            ))}
          </div>
          <div className="mx-auto w-full max-w-sm self-start lg:sticky lg:top-24 lg:max-w-none">
            {tall.map((f) => (
              <FilmPlayer key={f.id} film={f} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
