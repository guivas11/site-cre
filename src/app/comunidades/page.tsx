import CommunityHub from "./CommunityHub";

const communities = [
  {
    id: "ligas-semanais",
    title: "Ligas Semanais CRE",
    description:
      "Calendario fixo com etapas semanais, regras claras e ranking atualizado.",
    tag: "Liga",
  },
  {
    id: "treino-hotlaps",
    title: "Treino Livre & Hotlaps",
    description:
      "Sala aberta para evoluir setups e buscar o melhor tempo do servidor.",
    tag: "Treino",
  },
  {
    id: "academia-pilotos",
    title: "Academia de Pilotos",
    description:
      "Dicas rapidas, mentoria e revisao de volta para quem quer subir de nivel.",
    tag: "Mentoria",
  },
  {
    id: "equipe-esports",
    title: "Equipe CRE E-Sports",
    description:
      "Seletivas e call com a staff para integrar o time oficial.",
    tag: "E-sports",
  },
];

const highlights = [
  {
    title: "Calendario da semana",
    content: "4 etapas, 2 sprints e 1 endurance marcado.",
  },
  {
    title: "Canal principal",
    content: "Convites, anuncios e chamadas rapidas para treino.",
  },
  {
    title: "Suporte ao piloto",
    content: "Ajuda com setups, problemas tecnicos e duvidas de regras.",
  },
];

const announcements = [
  {
    id: "anuncio-1",
    community_id: "ligas-semanais",
    date: "Semana 02",
    title: "Inscricoes abertas",
    content: "Confirmacao de grid ate sexta 22h. Check-in obrigatorio.",
  },
  {
    id: "anuncio-2",
    community_id: "treino-hotlaps",
    date: "Hoje",
    title: "Hotlap Suzuka",
    content: "Servidor aberto para treino livre com ranking ao vivo.",
  },
  {
    id: "anuncio-3",
    community_id: "academia-pilotos",
    date: "Quinta",
    title: "Mentoria coletiva",
    content: "Sessao ao vivo sobre freada e tracado. Traga suas duvidas.",
  },
];
const quickLinks = [
  {
    label: "Discord oficial CRE",
    href: "https://discord.gg/9dKEMMCZWW",
  },
  {
    label: "Calendario CRE 2026",
    href: "#",
  },
  {
    label: "Canal de anuncios",
    href: "#",
  },
];

export default function ComunidadesPage() {
  return (
    <div className="min-h-screen racing-bg text-white">
      <div className="absolute inset-0 track-grid opacity-35" />
      <div className="absolute inset-0 scanline opacity-15" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-24 pt-6 md:gap-10 md:px-6 md:pt-8">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-yellow-300">
              Comunidade CRE
            </p>
            <h1 className="font-display text-4xl tracking-[0.12em] sm:text-5xl">
              Comunidades e eventos
            </h1>
            <p className="mt-3 max-w-xl text-sm text-zinc-300">
              Encontre ligas, salas e grupos oficiais da CRE para correr, treinar
              e crescer junto.
            </p>
          </div>
          <a
            className="rounded-full border border-white/20 px-5 py-3 text-xs uppercase tracking-[0.25em] text-zinc-200 transition hover:border-white/50 hover:text-white"
            href="/"
          >
            Voltar para a home
          </a>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="glass rounded-2xl p-4 md:rounded-3xl md:p-6">
            <h2 className="text-sm uppercase tracking-[0.4em] text-yellow-300">
              Destaques
            </h2>
            <div className="mt-5 grid gap-4">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-black/40 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                    {item.title}
                  </p>
                  <p className="mt-2 text-sm text-zinc-200">{item.content}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="glass rounded-2xl p-4 md:rounded-3xl md:p-6">
            <h2 className="text-sm uppercase tracking-[0.4em] text-yellow-300">
              Entrar agora
            </h2>
            <p className="mt-3 text-sm text-zinc-300">
              Entre na comunidade oficial e receba avisos de corridas, treinos e
              eventos especiais.
            </p>
            <div className="mt-6 grid gap-3 text-sm text-zinc-300">
              {quickLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 transition hover:border-white/30 hover:text-white"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </aside>
        </section>

        <section className="glass rounded-3xl overflow-hidden">
          <div className="primary-stripe h-2" />
          <CommunityHub communities={communities} announcements={announcements} />
        </section>
      </div>
    </div>
  );
}





