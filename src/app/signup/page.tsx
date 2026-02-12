import { signUp } from "./actions";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PasswordField from "./PasswordField";

type SignupPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export const dynamic = "force-dynamic";

export default async function SignupPage({ searchParams }: SignupPageProps) {
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

      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-24 pt-6 md:gap-10 md:px-6 md:pt-12">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-yellow-300">CRE</p>
            <h1 className="font-display text-4xl tracking-[0.12em]">Criar conta</h1>
          </div>
          <a
            className="w-full rounded-full border border-white/20 px-5 py-3 text-center text-xs uppercase tracking-[0.25em] text-zinc-200 transition hover:border-white/50 hover:text-white sm:w-auto"
            href="/"
          >
            Voltar para a home
          </a>
        </header>

        <section className="glass mx-auto w-full max-w-lg rounded-2xl p-4 sm:rounded-3xl sm:p-8">
          <form className="flex flex-col gap-5" action={signUp}>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-zinc-400">E-mail</label>
              <input
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white placeholder:text-zinc-500"
                name="email"
                type="email"
                placeholder="voce@email.com"
                required
              />
            </div>
            <PasswordField />

            {params.error ? (
              <p className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {params.error}
              </p>
            ) : null}

            <button className="rounded-full bg-yellow-300 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-yellow-200">
              Criar conta
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-2 text-xs uppercase tracking-[0.25em] text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
            <span>Ja tem conta?</span>
            <a className="text-blue-300 hover:text-blue-200" href="/login">
              Fazer login
            </a>
          </div>
          <p className="mt-4 text-xs text-zinc-500">
            Voce pode entrar com Google assim que o provedor estiver ativo.
          </p>
        </section>
      </div>
    </div>
  );
}
