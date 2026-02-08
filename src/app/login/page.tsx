import { signIn } from "./actions";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AuthProviders from "./AuthProviders";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen racing-bg text-white">
      <div className="absolute inset-0 track-grid opacity-35" />
      <div className="absolute inset-0 scanline opacity-15" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-24 pt-12">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-yellow-300">
              CRE
            </p>
            <h1 className="font-display text-4xl tracking-[0.12em]">
              Entrar no blog
            </h1>
          </div>
          <a
            className="rounded-full border border-white/20 px-5 py-3 text-xs uppercase tracking-[0.25em] text-zinc-200 transition hover:border-white/50 hover:text-white"
            href="/"
          >
            Voltar para a home
          </a>
        </header>

        <section className="glass mx-auto w-full max-w-lg rounded-3xl p-8">
          <form className="flex flex-col gap-5" action={signIn}>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                E-mail
              </label>
              <input
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white placeholder:text-zinc-500"
                name="email"
                type="email"
                placeholder="voce@email.com"
                required
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                Senha
              </label>
              <input
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white placeholder:text-zinc-500"
                name="password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>

            {params.error ? (
              <p className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {params.error}
              </p>
            ) : null}

            <button className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-blue-500">
              Entrar
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5 text-xs uppercase tracking-[0.25em] text-zinc-400">
            <span>Não tem conta?</span>
            <a className="text-yellow-300 hover:text-yellow-200" href="/signup">
              Criar conta
            </a>
          </div>
          <p className="mt-4 text-xs text-zinc-500">
            Login com Google ficará disponível quando você configurar o provedor.
          </p>
          <div className="mt-4 flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-zinc-500">
            <span>Ou continue com</span>
            <AuthProviders />
          </div>
        </section>
      </div>
    </div>
  );
}
