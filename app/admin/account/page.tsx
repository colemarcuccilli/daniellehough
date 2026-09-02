import { requireAdmin } from "@/lib/admin";
import { PasswordForm } from "@/components/admin/password-form";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const { supabase, admin } = await requireAdmin();
  const { data: admins } = await supabase.from("admins").select("email, display_name, created_at").order("created_at");

  return (
    <div className="space-y-10 max-w-3xl">
      <header>
        <p className="eyebrow mb-2">{admin.email}</p>
        <h1 className="display text-4xl">Account</h1>
      </header>

      <section className="outline-card p-6 space-y-4">
        <h2 className="display text-2xl">Change password</h2>
        <PasswordForm />
      </section>

      <section className="outline-card-soft p-6 space-y-4">
        <h2 className="display text-2xl">Admins</h2>
        <ul className="divide-y divide-line">
          {((admins ?? []) as { email: string; display_name: string | null }[]).map((a) => (
            <li key={a.email} className="py-2 flex items-center justify-between gap-3 text-sm">
              <span>{a.display_name ?? a.email}</span>
              <span className="text-ink-faint">{a.email}</span>
            </li>
          ))}
        </ul>
        <div className="text-sm text-ink-soft space-y-2">
          <p>
            There is no public sign-up. To add another admin (for example Danielle&apos;s own email), run the SQL in
            <span className="font-mono text-xs"> supabase/seed/add_admin.sql</span> from the Supabase SQL editor with her
            email and a starting password. She can change it here afterwards.
          </p>
        </div>
      </section>
    </div>
  );
}
