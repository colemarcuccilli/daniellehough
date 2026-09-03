import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/sidebar";
import { signOut } from "./actions";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: { default: "Admin", template: "%s · Admin · Dani Cams" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The login page shares this layout; proxy.ts already bounces anonymous
  // visitors away from every other /admin route.
  if (!user) return <>{children}</>;

  const { data: admin } = await supabase
    .from("admins")
    .select("user_id, email, display_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin) {
    return (
      <div className="min-h-screen grid place-items-center px-6">
        <div className="outline-card p-8 max-w-md text-center">
          <h1 className="display text-3xl">Not on the list</h1>
          <p className="mt-3 text-sm text-ink-soft">
            {user.email} is signed in but is not an admin of this studio. Ask the owner to add you, or sign out.
          </p>
          <form action={signOut} className="mt-6">
            <Button type="submit" variant="outline">Sign out</Button>
          </form>
          <Link href="/" className="mt-4 inline-block text-sm underline underline-offset-4">Back to the site</Link>
        </div>
      </div>
    );
  }

  const { count: newInquiries } = await supabase
    .from("inquiries")
    .select("id", { count: "exact", head: true })
    .eq("status", "new");

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <AdminSidebar email={admin.email as string} name={(admin.display_name as string | null) ?? null} newInquiries={newInquiries ?? 0} />
      <main className="min-w-0 bg-bg">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-8 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
