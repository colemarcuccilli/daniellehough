import Link from "next/link";
import { ExternalLink, FolderKanban, Inbox, KeyRound, LayoutDashboard, LogOut, Tags } from "lucide-react";
import { LogoMark, Wordmark } from "@/components/public/logo";
import { NavLink } from "@/components/admin/nav-link";
import { signOut } from "@/app/admin/actions";

export function AdminSidebar({ email, name, newInquiries }: { email: string; name: string | null; newInquiries: number }) {
  return (
    <aside className="border-b border-ink bg-cream lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r flex flex-col">
      <div className="flex items-center justify-between gap-3 px-4 py-4 lg:px-5">
        <Link href="/admin" className="flex items-center gap-2.5">
          <LogoMark height={28} />
          <Wordmark className="text-lg" />
        </Link>
        <span className="hidden lg:inline rounded-xs border border-ink bg-paper px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]">Admin</span>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3 lg:pb-0">
        <NavLink href="/admin" exact icon={<LayoutDashboard size={15} />}>Dashboard</NavLink>
        <NavLink href="/admin/projects" icon={<FolderKanban size={15} />}>Projects</NavLink>
        <NavLink href="/admin/categories" icon={<Tags size={15} />}>Categories</NavLink>
        <NavLink href="/admin/inquiries" icon={<Inbox size={15} />} badge={newInquiries}>Inquiries</NavLink>
        <NavLink href="/admin/account" icon={<KeyRound size={15} />}>Account</NavLink>
      </nav>
      <div className="mt-auto hidden lg:block border-t border-line p-4 space-y-3">
        <Link href="/" target="_blank" className="flex items-center gap-2 text-sm text-ink-soft hover:text-ink">
          <ExternalLink size={14} /> View site
        </Link>
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm truncate">{name ?? email}</p>
            <p className="text-[11px] text-ink-faint truncate">{email}</p>
          </div>
          <form action={signOut}>
            <button type="submit" aria-label="Sign out" className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-transparent text-ink-faint hover:text-ink hover:border-ink">
              <LogOut size={14} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
