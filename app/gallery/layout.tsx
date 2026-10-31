import Link from "next/link";
import { Wordmark } from "@/components/public/logo";

/**
 * Client galleries get a quiet shell: no site nav, no inquiry pop-up, just the
 * photographs and a small sign-off. Guests arrive here from a shared link.
 */
export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  const year = new Date().getFullYear();
  return (
    <>
      <main className="flex-1">{children}</main>
      <footer className="mt-20 border-t border-line bg-cream">
        <div className="caps mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-6 text-[0.6rem] text-ink-faint sm:px-6">
          <Link href="/" className="inline-flex items-center gap-2 text-ink hover:text-marigold-deep">
            <Wordmark className="text-[0.8rem]" />
          </Link>
          <span>Photographs &copy; {year} Danielle Hough &middot; danicams.com</span>
        </div>
      </footer>
    </>
  );
}
