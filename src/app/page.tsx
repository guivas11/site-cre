const featured = {
  title: "Especial de Interlagos: a volta perfeita da CRE",
  excerpt:
    "Reunimos os bastidores, telemetria e os momentos decisivos da corrida que consagrou a equipe na última etapa.",
  author: "Equipe CRE",
  date: "08 Fev 2026",
};

const posts = [
  {
    title: "Guia de setup: equilíbrio no miolo",
    excerpt:
      "Ajustes finos de asa, rake e pressão para manter o carro vivo nas curvas lentas.",
    tag: "Setup",
    author: "Pedro Lima",
    date: "07 Fev 2026",
  },
  {
    title: "Vitória na chuva: estratégia em Suzuka",
    excerpt:
      "Quando a pista vira espelho, é a leitura de corrida que decide o pódio.",
    tag: "Relato",
    author: "Camila Torres",
    date: "06 Fev 2026",
  },
  {
    title: "Mentoria rápida: saída de box sem perder tempo",
    excerpt:
      "Detalhes práticos para ganhar décimos preciosos no pit lane.",
    tag: "Dica",
    author: "Gui Nakamura",
    date: "05 Fev 2026",
  },
  {
    title: "Calendário CRE 2026: datas confirmadas",
    excerpt:
      "Confira as etapas, horários e regras especiais da nova temporada.",
    tag: "Agenda",
    author: "Diretoria CRE",
    date: "04 Fev 2026",
  },
];

const wins = [
  { pilot: "Maya Rios", track: "Spa 24h", position: "1º" },
  { pilot: "Luan Batista", track: "Interlagos", position: "1º" },
  { pilot: "Ana Bezerra", track: "Monza", position: "1º" },
  { pilot: "Vitor Gama", track: "Daytona", position: "2º" },
];

const categories = [
  "Vitórias",
  "Setups",
  "Histórias",
  "Entrevistas",
  "Agenda",
  "Treinos",
];

export default function Home() {
  return (
    <div className="min-h-screen racing-bg text-white">
      <div className="absolute inset-0 track-grid opacity-35" />
      <div className="absolute inset-0 scanline opacity-15" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-16 px-6 pb-24 pt-8">
        <header className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="spark h-12 w-12 rounded-2xl bg-gradient-to-br from-yellow-300 via-orange-500 to-red-600 p-[2px]">
              <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-black/90 text-sm font-semibold tracking-[0.2em]">
                CRE
              </div>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.4em] text-yellow-300/80">
                Caffé Racing
              </p>
              <p className="font-display text-2xl tracking-[0.2em]">
                Blog dos Pilotos
              </p>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-xs uppercase tracking-[0.25em] text-zinc-300 md:flex">
            <a className="transition hover:text-yellow-300" href="#">
              Pilotos
            </a>
            <a className="transition hover:text-yellow-300" href="#">
              Vitórias
            </a>
            <a className="transition hover:text-yellow-300" href="#">
              Agenda
            </a>
            <a className="transition hover:text-yellow-300" href="#">
              Comunidade
            </a>
          </nav>
          <a
            className="hidden rounded-full border border-yellow-300/50 px-5 py-2 text-xs uppercase tracking-[0.25em] transition hover:border-yellow-300 hover:text-yellow-300 md:inline-flex"
            href="/login"
          >
            Entrar
          </a>
        </header>

        <main className="flex flex-col gap-16">
          <section className="grid gap-8 lg:grid-cols-[1.5fr_0.9fr]">
            <div className="glass rounded-3xl p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-yellow-300 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-black">
                  Destaque
                </span>
                <span className="text-xs uppercase tracking-[0.3em] text-blue-200">
                  {featured.date}
                </span>
              </div>
              <h1 className="mt-5 font-display text-4xl tracking-[0.08em] sm:text-5xl">
                {featured.title}
              </h1>
              <p className="mt-4 text-base text-zinc-200">{featured.excerpt}</p>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.3em] text-zinc-400">
                <span>Por {featured.author}</span>
                <span>·</span>
                <span>Tempo de leitura: 6 min</span>
              </div>
              <div className="mt-6 flex gap-3">
                <button className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-blue-500">
                  Ler agora
                </button>
                <a
                  className="rounded-full border border-red-500/60 px-6 py-3 text-sm uppercase tracking-[0.2em] text-red-200 transition hover:border-red-400 hover:text-red-100"
                  href="/posts"
                >
                  Ver últimos posts
                </a>
              </div>
            </div>

            <aside className="flex flex-col gap-6">
              <div className="glass rounded-3xl p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-yellow-300">
                  Categorias
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <span
                      key={category}
                      className="rounded-full border border-white/15 px-3 py-2 text-xs uppercase tracking-[0.25em] text-zinc-200"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>

              <div className="glass rounded-3xl p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-red-300">
                  Vitórias recentes
                </p>
                <div className="mt-4 grid gap-3">
                  {wins.map((win) => (
                    <div
                      key={`${win.pilot}-${win.track}`}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm uppercase tracking-[0.25em] text-yellow-300/80">
                          {win.track}
                        </p>
                        <p className="text-base">{win.pilot}</p>
                      </div>
                      <span className="text-lg font-semibold text-yellow-300">
                        {win.position}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </section>

          <section className="glass rounded-3xl overflow-hidden">
            <div className="primary-stripe h-2" />
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl tracking-[0.18em]">
                  Últimos posts
                </h2>
                <span className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                  Atualizado diariamente
                </span>
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {posts.map((post) => (
                  <article
                    key={post.title}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-white/25"
                  >
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em]">
                      <span className="rounded-full bg-red-600/80 px-3 py-1 text-[10px] text-white">
                        {post.tag}
                      </span>
                      <span className="text-zinc-400">{post.date}</span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-white">
                      {post.title}
                    </h3>
                    <p className="mt-2 text-sm text-zinc-300">{post.excerpt}</p>
                    <p className="mt-4 text-xs uppercase tracking-[0.3em] text-yellow-300">
                      {post.author}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="glass rounded-3xl p-6 sm:p-8">
              <h3 className="font-display text-2xl tracking-[0.18em]">
                Editorial da semana
              </h3>
              <p className="mt-4 text-base text-zinc-200">
                Bastidores do paddock, entrevistas curtas e análise de setups
                para você aplicar na próxima corrida.
              </p>
              <div className="mt-6 grid gap-4">
                {["Entrevista com a equipe técnica", "Checklist de corrida em pista molhada", "Linha de tempo da temporada CRE"].map(
                  (item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <span className="text-sm">{item}</span>
                      <span className="text-xs uppercase tracking-[0.3em] text-blue-200">
                        Ler
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="glass rounded-3xl p-6 sm:p-8">
              <p className="text-xs uppercase tracking-[0.3em] text-yellow-300">
                Assine o blog
              </p>
              <p className="mt-4 text-base text-zinc-200">
                Receba vitórias, setups e agenda da semana direto no e-mail.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <input
                  className="rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-zinc-500"
                  placeholder="Seu e-mail"
                />
                <button className="rounded-full bg-yellow-300 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-black">
                  Quero receber
                </button>
              </div>
              <p className="mt-4 text-xs uppercase tracking-[0.3em] text-zinc-500">
                Sem spam. Só conteúdo de corrida.
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
