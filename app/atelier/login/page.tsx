import { LoginForm } from "./login-form";
import { Sun } from "@/components/public/sun";

export const metadata = { title: "Atelier · sign in" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; sent?: string }>;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:flex items-center justify-center bg-marigold/10 grain border-r border-line overflow-hidden">
        <div className="absolute -top-12 -left-12 opacity-50">
          <Sun size={420} />
        </div>
        <div className="relative max-w-md px-12 py-20">
          <p className="font-hand text-3xl text-terracotta mb-4">private —</p>
          <h2 className="font-display text-5xl leading-[1.05] tracking-tight">
            A small room
            <br />
            <em>just for the ideas.</em>
          </h2>
          <p className="mt-6 text-ink-soft leading-relaxed">
            Catch sparks. Hold them. Pick exactly one to make. Move on.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center px-6 py-20">
        <div className="w-full max-w-sm space-y-8">
          <header className="space-y-2">
            <p className="font-hand text-xl text-marigold-deep">
              welcome back —
            </p>
            <h1 className="font-display text-4xl tracking-tight">
              Sign in to the studio
            </h1>
            <p className="text-sm text-ink-soft">
              We&rsquo;ll send a one-time link to your inbox.
            </p>
          </header>

          <LoginFormWrapper searchParams={searchParams} />
        </div>
      </div>
    </div>
  );
}

async function LoginFormWrapper({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; sent?: string }>;
}) {
  const sp = await searchParams;
  return <LoginForm next={sp.next} sent={sp.sent === "1"} />;
}
