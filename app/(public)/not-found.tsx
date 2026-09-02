import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/public/section";

export default function NotFound() {
  return (
    <Container className="py-32 text-center">
      <p className="eyebrow no-rule justify-center mb-4">404</p>
      <h1 className="display text-5xl sm:text-6xl">That frame is empty.</h1>
      <p className="mt-4 text-ink-soft">The page you were after has moved or never existed.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/portfolio" className={buttonStyles({ variant: "primary" })}>Portfolio</Link>
        <Link href="/" className={buttonStyles({ variant: "outline" })}>Home</Link>
      </div>
    </Container>
  );
}
