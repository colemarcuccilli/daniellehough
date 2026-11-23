import { cn } from "@/lib/utils";

type Pt = { x: number; y: number };

const quad = (a: Pt, c: Pt, b: Pt, t: number): Pt => ({
  x: (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * c.x + t * t * b.x,
  y: (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * c.y + t * t * b.y,
});
const r1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Eucalyptus branch: a curved stem with soft filled leaves, in the current
 * text colour. Decorative. Flip or rotate it with utility classes.
 */
export function Branch({ className, leaves = 13 }: { className?: string; leaves?: number }) {
  const a = { x: 6, y: 96 };
  const c = { x: 150, y: 20 };
  const b = { x: 314, y: 66 };
  const items = Array.from({ length: leaves }, (_, i) => {
    const t = 0.07 + (i / (leaves - 1)) * 0.9;
    const p = quad(a, c, b, t);
    const q = quad(a, c, b, t + 0.01);
    const ang = Math.atan2(q.y - p.y, q.x - p.x);
    const side = i % 2 === 0 ? -1 : 1;
    const taper = 1 - t * 0.5;
    const rx = 17 * taper;
    const ry = 10.5 * taper;
    const lean = ang + side * 1.02;
    const cx = p.x + Math.cos(lean) * (rx + 1.5);
    const cy = p.y + Math.sin(lean) * (rx + 1.5);
    return { cx: r1(cx), cy: r1(cy), rx: r1(rx), ry: r1(ry), rot: r1((lean * 180) / Math.PI), o: i % 3 === 0 ? 0.5 : i % 3 === 1 ? 0.72 : 0.38 };
  });
  const tip = quad(a, c, b, 1);
  return (
    <svg viewBox="0 0 320 130" aria-hidden focusable="false" className={cn("block", className)} fill="currentColor">
      <path d={`M${a.x} ${a.y} Q ${c.x} ${c.y} ${b.x} ${b.y}`} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.8" />
      {items.map((l, i) => (
        <ellipse key={i} cx={l.cx} cy={l.cy} rx={l.rx} ry={l.ry} transform={`rotate(${l.rot} ${l.cx} ${l.cy})`} opacity={l.o} />
      ))}
      <ellipse cx={r1(tip.x + 4)} cy={r1(tip.y + 2)} rx="7" ry="4.5" transform={`rotate(18 ${r1(tip.x + 4)} ${r1(tip.y + 2)})`} opacity="0.6" />
    </svg>
  );
}

/** Leaf wreath, open at the top. Put a number, initial, or icon inside it. */
export function Wreath({ className, children }: { className?: string; children?: React.ReactNode }) {
  const n = 22;
  const R = 40;
  const items = Array.from({ length: n }, (_, i) => {
    // sweep from the upper right, down around, to the upper left; leave the top open
    const t = (-58 + (i / (n - 1)) * 296) * (Math.PI / 180);
    const x = 50 + Math.cos(t) * R;
    const y = 50 + Math.sin(t) * R;
    const out = i % 2 === 0 ? 1 : -1;
    const rot = (t * 180) / Math.PI + 90 + out * 38;
    return { x: r1(x + Math.cos(t) * out * 3.4), y: r1(y + Math.sin(t) * out * 3.4), rot: r1(rot), o: i % 3 === 0 ? 0.5 : 0.75 };
  });
  return (
    <span className={cn("relative inline-grid place-items-center", className)}>
      <svg viewBox="0 0 100 100" aria-hidden focusable="false" className="absolute inset-0 h-full w-full" fill="currentColor">
        <path d="M71.2 16.1 A40 40 0 1 1 28.8 16.1" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.7" strokeLinecap="round" />
        {items.map((l, i) => (
          <ellipse key={i} cx={l.x} cy={l.y} rx="7.2" ry="3.3" transform={`rotate(${l.rot} ${l.x} ${l.y})`} opacity={l.o} />
        ))}
      </svg>
      <span className="relative">{children}</span>
    </span>
  );
}

/** Centred divider: two small branches meeting at a dot. */
export function Garland({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-3 text-sage", className)} aria-hidden>
      <Branch className="h-12 w-auto -scale-x-100" leaves={9} />
      <span className="h-1.5 w-1.5 rotate-45 bg-marigold" />
      <Branch className="h-12 w-auto" leaves={9} />
    </div>
  );
}
