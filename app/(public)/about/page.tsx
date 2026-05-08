import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { Sun } from "@/components/public/sun";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <article className="relative">
      <div className="pointer-events-none absolute top-12 right-0 opacity-30">
        <Sun size={220} />
      </div>

      <div className="mx-auto max-w-3xl px-6 lg:px-10 pt-20 pb-16">
        <p className="font-hand text-2xl text-terracotta mb-4">
          a little about —
        </p>
        <h1 className="font-display text-6xl lg:text-7xl tracking-tight leading-[0.95] mb-12">
          Who is making <em>this</em>?
        </h1>

        <div className="space-y-8 text-lg text-ink leading-[1.7]">
          <p className="text-2xl text-ink-soft font-display italic leading-snug">
            I&rsquo;m Danielle. I take pictures, I make films, and I keep
            notebooks I never finish — until I do.
          </p>

          <p>
            My work tries to find the soft pause inside loud moments. I
            grew up paying close attention to ordinary things: the angle of
            late afternoon sun across a kitchen, somebody&rsquo;s hands when
            they think nobody is watching, the second after a person
            laughs.
          </p>

          <p>
            I&rsquo;m drawn to people who are in the middle of becoming
            something else. Brides the morning of. Dancers between takes.
            Musicians at soundcheck. Parents three weeks in.
          </p>

          <p>
            Most of the year I shoot weddings, editorial, brand work, and
            music videos. The rest of the year I work on personal series
            you haven&rsquo;t seen yet.
          </p>
        </div>

        <hr className="my-16 border-line" />

        <div className="grid gap-10 sm:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl mb-3">What I do</h2>
            <ul className="space-y-1.5 text-ink-soft">
              <li>— Editorial &amp; portrait photography</li>
              <li>— Brand films &amp; music videos</li>
              <li>— Weddings &amp; once-in-a-life</li>
              <li>— Concept series &amp; visual studies</li>
            </ul>
          </div>
          <div>
            <h2 className="font-display text-2xl mb-3">Where</h2>
            <ul className="space-y-1.5 text-ink-soft">
              <li>— Based in the Midwest</li>
              <li>— Travels for the right project</li>
              <li>— Always one new idea ahead</li>
            </ul>
          </div>
        </div>

        <div className="mt-16">
          <Link
            href="/contact"
            className={buttonStyles({ variant: "marigold", size: "lg" })}
          >
            Start something with me
          </Link>
        </div>
      </div>
    </article>
  );
}
