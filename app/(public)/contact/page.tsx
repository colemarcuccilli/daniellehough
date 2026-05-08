import { Sun } from "@/components/public/sun";
import { Mail, MapPin, AtSign } from "lucide-react";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute -bottom-12 -left-12 opacity-30">
        <Sun size={260} />
      </div>

      <div className="mx-auto max-w-3xl px-6 lg:px-10 pt-20 pb-32 relative">
        <p className="font-hand text-2xl text-terracotta mb-4">
          let&rsquo;s talk —
        </p>
        <h1 className="font-display text-6xl lg:text-7xl tracking-tight leading-[0.95] mb-12">
          Tell me about
          <br />
          <em className="hand-underline">your idea.</em>
        </h1>

        <p className="text-lg text-ink-soft leading-relaxed max-w-lg mb-16">
          Brand, editorial, wedding, music video, weird little personal
          dream &mdash; I want to hear it. The strangest projects always
          start with the most casual emails.
        </p>

        <div className="space-y-6">
          <ContactRow
            icon={<Mail size={20} />}
            label="Email"
            value="hello@daniellehough.com"
            href="mailto:hello@daniellehough.com"
          />
          <ContactRow
            icon={<AtSign size={20} />}
            label="Instagram"
            value="@daniellehough"
            href="https://instagram.com/daniellehough"
          />
          <ContactRow
            icon={<MapPin size={20} />}
            label="Based in"
            value="Midwest US — travels worldwide"
          />
        </div>

        <p className="mt-20 font-hand text-2xl text-marigold-deep">
          See you in the inbox.
        </p>
      </div>
    </div>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const Tag = href ? "a" : "div";
  return (
    <Tag
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      className="group flex items-center gap-5 py-3 border-b border-line/50 hover:border-marigold transition-colors"
    >
      <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-cream text-ink-soft group-hover:text-marigold-deep group-hover:bg-marigold-glow transition-colors">
        {icon}
      </span>
      <span className="flex-1 flex flex-col sm:flex-row sm:items-baseline sm:gap-4">
        <span className="text-xs uppercase tracking-[0.18em] text-ink-faint">
          {label}
        </span>
        <span className="font-display text-xl text-ink">{value}</span>
      </span>
    </Tag>
  );
}
