import Link from "next/link";

export default function GalleryNotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 py-32 text-center">
      <p className="eyebrow mb-4 justify-center">Gallery</p>
      <h1 className="display text-5xl">This gallery isn&rsquo;t available</h1>
      <p className="mt-4 text-ink-soft">The link may be incomplete, or the gallery has been closed. Check with whoever shared it with you.</p>
      <Link href="/" className="mt-8 inline-block underline underline-offset-4 decoration-marigold-deep hover:text-marigold-deep">
        danicams.com
      </Link>
    </div>
  );
}
