import { LoginForm } from "./login-form";
import { LogoMark, Wordmark } from "@/components/public/logo";

export const metadata = { title: "Admin · sign in", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const sp = await searchParams;
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:flex items-center justify-center bg-slate-deep text-cream border-r border-ink overflow-hidden">
        <div className="absolute -bottom-24 -right-16 opacity-90 rotate-12">
          <LogoMark height={640} />
        </div>
        <div className="relative max-w-md px-12 py-20">
          <p className="eyebrow mb-4 [&::before]:bg-marigold text-cream/70">Studio admin</p>
          <h2 className="display text-5xl leading-[1.05]">Projects, photos, and the people asking for them.</h2>
          <p className="mt-6 text-cream/75 leading-relaxed">
            Upload originals, set covers, drag the order, publish. Inquiries land here too.
          </p>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center px-6 py-20">
        <div className="w-full max-w-sm space-y-8">
          <header className="space-y-3">
            <div className="flex items-center gap-2.5">
              <LogoMark height={30} />
              <Wordmark />
            </div>
            <h1 className="display text-4xl">Sign in</h1>
          </header>
          <LoginForm next={sp.next} />
        </div>
      </div>
    </div>
  );
}
