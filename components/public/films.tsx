import { FILMS } from "@/lib/content";
import { Container } from "@/components/public/section";
import { FilmPlayer } from "@/components/public/film-player";

/** Plum band. One row on desktop, all three at the same height: wedding film, save-the-date video, social media recap. */
export function Films({ id = "films" }: { id?: string }) {
  return (
    <section id={id} className="scroll-mt-16 bg-plum py-16 text-cream sm:py-24">
      <Container>
        <h2 className="display mb-10 text-6xl sm:text-7xl lg:text-8xl">Films</h2>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-6">
          {FILMS.map((f) => (
            <FilmPlayer
              key={f.id}
              film={f}
              className={f.vertical ? "mx-auto w-full max-w-xs lg:mx-0 lg:max-w-none lg:basis-0" : "w-full lg:basis-0"}
              style={{ flexGrow: f.vertical ? 9 / 16 : 16 / 9 }}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
