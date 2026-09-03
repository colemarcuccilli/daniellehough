import { redirect } from "next/navigation";

const KINDS = ["retainer", "headshots", "event", "product", "mini_session", "other"];

/** The inquiry form is a pop-up now; old /contact links open it on the home page. */
export default async function ContactRedirect({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const { kind } = await searchParams;
  redirect(`/?inquire=${kind && KINDS.includes(kind) ? kind : "other"}`);
}
