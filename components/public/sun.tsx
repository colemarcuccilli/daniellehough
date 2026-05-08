import { cn } from "@/lib/utils";

type SunProps = {
  className?: string;
  size?: number;
};

export function Sun({ className, size = 200 }: SunProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      aria-hidden
      className={cn("text-marigold", className)}
    >
      <g className="sun-rays">
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 360) / 12;
          return (
            <line
              key={i}
              x1="100"
              y1="20"
              x2="100"
              y2="42"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              transform={`rotate(${angle} 100 100)`}
            />
          );
        })}
      </g>
      <circle
        cx="100"
        cy="100"
        r="36"
        fill="currentColor"
      />
      <circle
        cx="100"
        cy="100"
        r="48"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="3 6"
        opacity="0.5"
      />
    </svg>
  );
}
