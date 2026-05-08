import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";
import { Sun, LogOut, Sparkles, Archive } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Atelier",
  robots: { index: false, follow: false },
};

export default async function AtelierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <AtelierShell>{children}</AtelierShell>
    </div>
  );
}

async function AtelierShell({ children }: { children: React.ReactNode }) {
  // The login page uses this layout but isn't auth-required.
  // We can't easily check the path here, so layout just provides the shell;
  // middleware enforces auth for non-login routes.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <>{children}</>;
  }

  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 lg:px-10 h-14 flex items-center justify-between">
          <Link
            href="/atelier"
            className="flex items-center gap-2 group"
            aria-label="Atelier home"
          >
            <span
              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-marigold text-ink"
              aria-hidden
            >
              <Sun size={14} strokeWidth={2.5} />
            </span>
            <span className="font-display text-lg tracking-tight">
              Atelier
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink href="/atelier" icon={<Sparkles size={14} />}>
              Studio
            </NavLink>
            <NavLink href="/atelier/archive" icon={<Archive size={14} />}>
              Archive
            </NavLink>
            <form action={signOut}>
              <button
                type="submit"
                className="ml-2 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-ink-faint hover:text-ink hover:bg-cream transition-colors"
                aria-label="Sign out"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">{user.email}</span>
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </>
  );
}

function NavLink({
  href,
  children,
  icon,
}: {
  href: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-ink-soft hover:text-ink hover:bg-cream transition-colors",
      )}
    >
      {icon}
      {children}
    </Link>
  );
}
