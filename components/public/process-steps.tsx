import { PROCESS } from "@/lib/content";
import { Wreath } from "@/components/public/greenery";

export function ProcessSteps() {
  return (
    <ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
      {PROCESS.map((p, i) => (
        <li key={p.title} className="text-center">
          <Wreath className="h-24 w-24 text-sage">
            <span className="display text-3xl text-ink">{i + 1}</span>
          </Wreath>
          <h3 className="display mt-4 text-3xl">{p.title}</h3>
          <p className="mx-auto mt-2 max-w-[16rem] text-sm leading-relaxed text-ink-soft">{p.body}</p>
        </li>
      ))}
    </ol>
  );
}
