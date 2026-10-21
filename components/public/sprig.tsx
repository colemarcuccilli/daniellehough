import { cn } from "@/lib/utils";

/**
 * Botanical line-art sprig, drawn in the current text colour. Decorative only;
 * mirror it with `-scale-x-100` for the opposite corner.
 */
export function Sprig({ className }: { className?: string }) {
  const flower = (x: number, y: number, s = 1) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle r="1.6" fill="currentColor" stroke="none" />
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="0" cy="-7.2" rx="3.1" ry="5.4" transform={`rotate(${a})`} />
      ))}
    </g>
  );
  const bud = (x: number, y: number, rot: number) => (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <ellipse rx="2.6" ry="5" />
      <path d="M0 5 L0 9" />
    </g>
  );
  return (
    <svg
      viewBox="0 0 220 300"
      aria-hidden
      focusable="false"
      className={cn("block", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.15"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* main stem */}
      <path d="M40 292 C 70 240, 100 190, 128 140 C 148 104, 166 60, 190 18" />
      {/* side twigs */}
      <path d="M80 222 C 72 212, 64 204, 54 198" />
      <path d="M134 128 C 144 128, 152 130, 160 132" />
      <path d="M168 56 C 162 48, 156 40, 148 34" />
      <path d="M186 28 C 192 22, 198 16, 206 12" />
      <path d="M180 40 C 174 34, 170 26, 170 18" />
      {/* leaves with midribs */}
      <path d="M62 250 C 40 244, 24 226, 22 204 C 44 208, 60 226, 62 250 Z" />
      <path d="M62 250 C 50 234, 38 220, 22 204" />
      <path d="M92 200 C 112 188, 134 188, 150 200 C 134 212, 112 212, 92 200 Z" />
      <path d="M92 200 C 112 199, 132 199, 150 200" />
      <path d="M120 150 C 100 142, 86 126, 84 106 C 104 112, 118 130, 120 150 Z" />
      <path d="M120 150 C 108 136, 96 120, 84 106" />
      <path d="M150 96 C 160 78, 178 70, 196 74 C 190 92, 172 102, 150 96 Z" />
      <path d="M150 96 C 166 88, 180 80, 196 74" />
      {/* blossoms and buds */}
      {flower(54, 198, 1)}
      {flower(160, 132, 0.9)}
      {flower(148, 34, 1)}
      {bud(206, 12, -40)}
      {bud(170, 18, 10)}
    </svg>
  );
}
