type VerifyPageProps = {
  searchParams: Promise<{ email?: string }>;
};

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const params = await searchParams;
  const email = params.email || "seu e-mail";

  return (
    <div className="min-h-screen racing-bg text-white">
      <div className="absolute inset-0 track-grid opacity-35" />
      <div className="absolute inset-0 scanline opacity-15" />

      <div className="relative mx-auto flex max-w-4xl flex-col gap-10 px-6 pb-24 pt-16">
        <header className="text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-yellow-300">
            Confirmação necessária
          </p>
          <h1 className="mt-4 font-display text-4xl tracking-[0.12em] sm:text-5xl">
            Confirme seu e-mail
          </h1>
          <p className="mt-4 text-base text-zinc-300">
            Enviamos um link de confirmação para{" "}
            <span className="text-yellow-300">{email}</span>.
          </p>
        </header>

        <section className="glass rounded-3xl p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-yellow-300/40 bg-yellow-300/10 text-yellow-300">
            <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 2l8 4.5v10.9L12 22l-8-4.6V6.5L12 2zm0 2.2L6 6.9v8.2l6 3.5 6-3.5V6.9l-6-2.7zm-1 4.2h2v5h-2V8.4zm0 6.6h2v2h-2v-2z"
              />
            </svg>
          </div>
          <h2 className="mt-6 font-display text-2xl tracking-[0.18em]">
            Quase lá
          </h2>
          <p className="mt-3 text-sm text-zinc-300">
            Abra seu e-mail e clique no link para ativar sua conta. Após
            confirmar, você será redirecionado para o seu perfil automaticamente.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 text-xs uppercase tracking-[0.3em] text-zinc-400">
            <span>Não recebeu?</span>
            <span>Verifique o spam ou aguarde alguns minutos.</span>
          </div>
          <a
            href="/login"
            className="mt-6 inline-flex rounded-full border border-white/20 px-5 py-3 text-xs uppercase tracking-[0.25em] text-zinc-200 transition hover:border-white/50 hover:text-white"
          >
            Voltar para login
          </a>
        </section>
      </div>
    </div>
  );
}
