const posts = [
  {
    title: "Guia de setup: equilíbrio no miolo",
    excerpt:
      "Ajustes finos de asa, rake e pressão para manter o carro vivo nas curvas lentas.",
    tag: "Setup",
    author: "Pedro Lima",
    date: "07 Fev 2026",
    read: "5 min",
  },
  {
    title: "Vitória na chuva: estratégia em Suzuka",
    excerpt:
      "Quando a pista vira espelho, é a leitura de corrida que decide o pódio.",
    tag: "Relato",
    author: "Camila Torres",
    date: "06 Fev 2026",
    read: "6 min",
  },
  {
    title: "Mentoria rápida: saída de box sem perder tempo",
    excerpt:
      "Detalhes práticos para ganhar décimos preciosos no pit lane.",
    tag: "Dica",
    author: "Gui Nakamura",
    date: "05 Fev 2026",
    read: "4 min",
  },
  {
    title: "Calendário CRE 2026: datas confirmadas",
    excerpt:
      "Confira as etapas, horários e regras especiais da nova temporada.",
    tag: "Agenda",
    author: "Diretoria CRE",
    date: "04 Fev 2026",
    read: "3 min",
  },
  {
    title: "Interlagos por dentro: volta perfeita em 58 giros",
    excerpt:
      "Telemetria, decisões e o ritmo certo para vencer quando tudo aperta.",
    tag: "Análise",
    author: "Equipe CRE",
    date: "03 Fev 2026",
    read: "7 min",
  },
  {
    title: "Checklist da corrida noturna",
    excerpt:
      "Luzes, pneus e foco: tudo o que muda quando o sol se apaga.",
    tag: "Guia",
    author: "Ana Bezerra",
    date: "02 Fev 2026",
    read: "5 min",
  },
];

export default function PostsPage() {
  return (
    <div className="min-h-screen racing-bg text-white">
      <div className="absolute inset-0 track-grid opacity-35" />
      <div className="absolute inset-0 scanline opacity-15" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-24 pt-8">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-yellow-300">
              Blog CRE
            </p>
            <h1 className="font-display text-4xl tracking-[0.12em] sm:text-5xl">
              Últimos posts
            </h1>
            <p className="mt-3 max-w-xl text-sm text-zinc-300">
              Conteúdo fresco sobre vitórias, setups e bastidores do paddock
              digital da CRE.
            </p>
          </div>
          <a
            className="rounded-full border border-white/20 px-5 py-3 text-xs uppercase tracking-[0.25em] text-zinc-200 transition hover:border-white/50 hover:text-white"
            href="/"
          >
            Voltar para a home
          </a>
        </header>

        <section className="glass rounded-3xl overflow-hidden">
          <div className="primary-stripe h-2" />
          <div className="grid gap-5 p-6 sm:p-8 md:grid-cols-2">
            {posts.map((post) => (
              <article
                key={post.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-white/25"
              >
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em]">
                  <span className="rounded-full bg-blue-600 px-3 py-1 text-[10px] text-white">
                    {post.tag}
                  </span>
                  <span className="text-zinc-400">{post.date}</span>
                  <span className="text-zinc-500">· {post.read}</span>
                </div>
                <h2 className="mt-3 text-lg font-semibold text-white">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm text-zinc-300">{post.excerpt}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.3em] text-yellow-300">
                  {post.author}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
