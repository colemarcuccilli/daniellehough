import { redirect } from "next/navigation";

import { ALL_INQUIRY_KINDS } from "@/lib/types";

const KINDS: string[] = ALL_INQUIRY_KINDS;

/** The inquiry form is a pop-up now; old /contact links open it on the home page. */
export default async function ContactRedirect({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const { kind } = await searchParams;
  redirect(`/?inquire=${kind && KINDS.includes(kind) ? kind : "wedding"}`);
}
