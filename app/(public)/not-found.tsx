import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { PageHeader } from "@/components/public/page-header";
import { Container } from "@/components/public/section";

export default function NotFound() {
  return (
    <>
      <PageHeader eyebrow="404" title="That frame is empty." body="The page you were after has moved or never existed." />
      <Container className="py-16">
        <div className="flex gap-3">
          <Link href="/portfolio" className={buttonStyles({ variant: "primary" })}>Portfolio</Link>
          <Link href="/" className={buttonStyles({ variant: "outline" })}>Home</Link>
        </div>
      </Container>
    </>
  );
}
