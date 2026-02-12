import { createClient } from "@/lib/supabase/server";
import TrackLeaders from "./track-leaders";
import { parsePostExcerpt } from "@/lib/posts/excerpt";

type LeaderEntry = {
  name: string;
  time: string;
};

type TrackLeader = {
  track: string;
  entries: LeaderEntry[];
};

type PostItem = {
  id: string;
  title: string;
  excerpt: string;
  tag: string;
  author: string | null;
  read_time: string | null;
  publish_date: string | null;
  created_at: string | null;
  cover_url: string | null;
};

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("display_name, avatar_url, username, is_admin")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  const displayName =
    profile?.display_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0];

  const { data: postsData } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  const posts = (postsData ?? []) as PostItem[];
  const featured = posts[0] ?? {
    id: "",
    title: "Sem posts ainda",
    excerpt: "Cadastre um post para aparecer aqui.",
    tag: "Destaque",
    author: "Equipe CRE",
    read_time: "5 min",
    publish_date: null,
    created_at: null,
    cover_url: null,
  };
  const latestPosts = posts.slice(0, 4);
  const categories = Array.from(
    new Set(posts.map((post) => post.tag).filter(Boolean)),
  ).slice(0, 6);
  const featuredLink = featured.id ? "/posts/" + featured.id : "/posts";
  const featuredParsed = parsePostExcerpt(featured.excerpt);

  const { data: lapTimes } = await supabase
    .from("lap_times")
    .select("user_id, track, time")
    .limit(500);

  const safeLapTimes = lapTimes ?? [];

  const { data: profileList } = await supabase
    .from("profiles")
    .select("id, display_name, username");

  const safeProfileList = profileList ?? [];
  const nameMap = new Map(
    safeProfileList.map((p) => [
      p.id,
      p.display_name || (p.username ? `@${p.username}` : "Piloto CRE"),
    ]),
  );

  const parseLap = (value: string) => {
    const match = value.match(/^(\d+):(\d{2})\.(\d{3})$/);
    if (!match) return Number.POSITIVE_INFINITY;
    return (
      Number(match[1]) * 60000 + Number(match[2]) * 1000 + Number(match[3])
    );
  };

  const grouped = new Map<string, LeaderEntry[]>();
  safeLapTimes.forEach((row) => {
    if (!row.track || !row.time) return;
    const entries = grouped.get(row.track) ?? [];
    entries.push({
      name: nameMap.get(row.user_id) || "Piloto CRE",
      time: row.time,
    });
    grouped.set(row.track, entries);
  });

  const trackLeaders: TrackLeader[] = Array.from(grouped.entries()).map(
    ([track, entries]) => ({
      track,
      entries: entries
        .sort((a, b) => parseLap(a.time) - parseLap(b.time))
        .slice(0, 3),
    }),
  );

  return (
    <div className="min-h-screen racing-bg text-white">
      <div className="absolute inset-0 track-grid opacity-35" />
      <div className="absolute inset-0 scanline opacity-15" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-24 pt-4 md:gap-10 md:px-6 md:pt-10">
        <header className="glass sticky top-2 z-30 rounded-2xl border border-white/10 bg-black/92 px-3 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur md:top-4 md:rounded-3xl md:px-6 md:py-3">
          <div className="flex items-center justify-between gap-3 md:grid md:grid-cols-[auto_1fr_auto] md:items-center md:gap-6">
            <a href="/" className="flex min-w-0 items-center gap-3">
              <div className="group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/40 p-1 shadow-[0_0_20px_rgba(0,0,0,0.45)] md:h-12 md:w-12 md:rounded-2xl">
                <div className="absolute inset-0 rounded-xl border border-yellow-300/20 opacity-0 transition group-hover:opacity-100 md:rounded-2xl" />
                <img
                  src="/logo-cre.png"
                  alt="CRE"
                  className="h-full w-full rounded-lg object-contain drop-shadow-[0_6px_18px_rgba(0,0,0,0.6)] md:rounded-xl"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[10px] uppercase tracking-[0.32em] text-yellow-300 md:text-xs md:tracking-[0.4em]">
                  Caffe Racing
                </p>
                <h1 className="truncate font-display text-base tracking-[0.14em] md:text-xl md:tracking-[0.25em]">
                  Blog dos pilotos
                </h1>
              </div>
            </a>


            <nav className="hidden items-center justify-center gap-2 text-[10px] uppercase tracking-[0.3em] text-zinc-300 md:flex">
              <a className="rounded-full border border-white/10 bg-black/40 px-3 py-2 transition hover:border-yellow-300/40 hover:text-yellow-100" href="/pilotos">Pilotos</a>
              <a className="rounded-full border border-white/10 bg-black/40 px-3 py-2 transition hover:border-yellow-300/40 hover:text-yellow-100" href="/vitorias">Vitorias</a>
              <a className="rounded-full border border-white/10 bg-black/40 px-3 py-2 transition hover:border-yellow-300/40 hover:text-yellow-100" href="/agendas">Agenda</a>
              <a className="rounded-full border border-white/10 bg-black/40 px-3 py-2 transition hover:border-yellow-300/40 hover:text-yellow-100" href="/comunidades">Comunidade</a>
              <a className="rounded-full border border-white/10 bg-black/40 px-3 py-2 transition hover:border-yellow-300/40 hover:text-yellow-100" href="/clips">Clips</a>
            </nav>
            <div className="md:hidden">
              {user ? (
                <a
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-full border border-yellow-300/40 bg-yellow-300/10 px-3 py-2 text-[10px] uppercase tracking-[0.24em] text-yellow-100"
                >
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Perfil" className="h-5 w-5 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/20 bg-white/5 text-[9px]">
                      {displayName?.slice(0, 1) || 'C'}
                    </span>
                  )}
                  Perfil
                </a>
              ) : (
                <a
                  className="rounded-full border border-white/20 px-3 py-2 text-[10px] uppercase tracking-[0.24em] text-zinc-200"
                  href="/login"
                >
                  Entrar
                </a>
              )}
            </div>

            <div className="hidden md:block">
              {user ? (
                <div className="flex items-center gap-3 rounded-full border border-white/15 bg-black/50 px-3 py-1.5">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Perfil"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/5 text-xs uppercase">
                      {displayName?.slice(0, 1) || 'C'}
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400">Logado como</p>
                    <p className="max-w-[140px] truncate text-sm text-white">{displayName || 'Piloto CRE'}</p>
                  </div>
                  <a
                    className="rounded-full border border-yellow-300/40 px-3 py-1.5 text-[10px] uppercase tracking-[0.3em] text-yellow-100 transition hover:border-yellow-300 hover:bg-yellow-300/10"
                    href="/dashboard"
                  >
                    Perfil
                  </a>
                </div>
              ) : (
                <a
                  className="rounded-full border border-white/20 px-3 py-1.5 text-[10px] uppercase tracking-[0.3em] text-zinc-200 transition hover:border-yellow-300 hover:text-yellow-100"
                  href="/login"
                >
                  Entrar
                </a>
              )}
            </div>
          </div>

          <nav className="mt-3 -mx-1 flex items-center gap-1.5 overflow-x-auto px-1 pb-1 text-[9px] uppercase tracking-[0.26em] text-zinc-300 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:hidden">
            <a className="shrink-0 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 transition hover:border-yellow-300/40 hover:text-yellow-100" href="/pilotos">
              Pilotos
            </a>
            <a className="shrink-0 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 transition hover:border-yellow-300/40 hover:text-yellow-100" href="/vitorias">
              Vitorias
            </a>
            <a className="shrink-0 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 transition hover:border-yellow-300/40 hover:text-yellow-100" href="/agendas">
              Agenda
            </a>
            <a className="shrink-0 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 transition hover:border-yellow-300/40 hover:text-yellow-100" href="/comunidades">
              Comunidade
            </a>
            <a className="shrink-0 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 transition hover:border-yellow-300/40 hover:text-yellow-100" href="/clips">
              Clips
            </a>
          </nav>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="glass overflow-hidden rounded-3xl border border-white/15 p-0 shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
            <div className="relative">
              {featured.cover_url ? (
                <img
                  src={featured.cover_url}
                  alt={featured.title}
                  className="h-60 w-full object-cover sm:h-72 md:h-80"
                />
              ) : (
                <div className="h-60 w-full bg-[linear-gradient(130deg,rgba(59,130,246,0.2),rgba(234,179,8,0.14),rgba(239,68,68,0.18))] sm:h-72 md:h-80" />
              )}

              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.15),rgba(0,0,0,0.84))]" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_45%)]" />

              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-zinc-200">
                  <span className="rounded-full bg-yellow-300 px-3 py-1 text-black">Destaque</span>
                  <span className="rounded-full border border-white/25 bg-black/45 px-3 py-1">
                    {featured.publish_date || featured.created_at || "Hoje"}
                  </span>
                  <span className="rounded-full border border-white/20 bg-black/45 px-3 py-1">
                    {featured.tag || "Post"}
                  </span>
                </div>

                <h1 className="mt-4 max-w-4xl font-display text-3xl leading-[0.95] tracking-[0.1em] text-white sm:text-4xl md:text-6xl md:tracking-[0.12em]">
                  {featured.title}
                </h1>
              </div>
            </div>

            <div className="p-4 sm:p-6 md:p-8">
              <div className="rounded-2xl border border-white/10 bg-black/45 p-4 sm:p-5">
                <div className="relative">
                  <p className="text-sm leading-relaxed text-zinc-300 whitespace-pre-line max-h-28 overflow-hidden">
                    {featuredParsed.text}
                  </p>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/90 to-transparent" />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <a
                    className="inline-flex items-center gap-2 rounded-full border border-yellow-300/35 bg-yellow-300/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-yellow-200 transition hover:border-yellow-200/70 hover:bg-yellow-300/20 hover:text-yellow-100"
                    href={featured.id ? `/posts/${featured.id}` : "/posts"}
                  >
                    Ler post
                    <span aria-hidden="true">&rarr;</span>
                  </a>
                  {featuredParsed.sourceUrl ? (
                    <a
                      className="inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-zinc-300 transition hover:border-white/35 hover:text-white"
                      href={featuredParsed.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Fonte
                    </a>
                  ) : null}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-zinc-400">
                <span>Assinado por {featured.author || "Equipe CRE"}</span>
                <span className="h-1 w-1 rounded-full bg-zinc-500" />
                <span>Leitura rapida: {featured.read_time ?? "5 min"}</span>
              </div>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
                <a
                  className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-blue-500"
                  href={featuredLink}
                >
                  Abrir materia
                </a>
                <a
                  className="rounded-full border border-red-400/40 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-red-200 transition hover:border-red-300 hover:text-red-100"
                  href="/posts"
                >
                  Ver todos os posts
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="glass rounded-2xl border border-white/12 p-4 md:rounded-3xl md:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xs uppercase tracking-[0.38em] text-yellow-300">
                  Categorias
                </h2>
                <span className="rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[9px] uppercase tracking-[0.24em] text-zinc-400">
                  {categories.length}
                </span>
              </div>
              <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                Conteudos por tema
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {categories.length === 0 ? (
                  <p className="col-span-2 rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-xs text-zinc-400">
                    Nenhuma categoria ainda.
                  </p>
                ) : (
                  categories.map((category) => (
                    <span
                      key={category}
                      className="inline-flex items-center justify-center rounded-xl border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.01))] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-200 transition hover:border-yellow-300/35 hover:text-yellow-100"
                    >
                      {category}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="glass rounded-2xl p-4 md:rounded-3xl md:p-6">
              <h2 className="text-xs uppercase tracking-[0.4em] text-red-300">
                Ranking de tempos
              </h2>
              <p className="mt-2 text-xs uppercase tracking-[0.35em] text-zinc-400">
                Melhor tempo por pista
              </p>
              <div className="mt-4 flex items-center gap-4">
                <TrackLeaders leaders={trackLeaders} />
              </div>
            </div>
          </div>
        </section>
        <section className="glass rounded-3xl border border-white/10 p-4 sm:p-6 md:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-display text-2xl tracking-[0.16em] text-white">
              Ultimos posts
            </h2>
            <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">
              atualizado diariamente
            </span>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {latestPosts.length === 0 ? (
              <p className="text-sm text-zinc-400">
                Nenhum post cadastrado ainda.
              </p>
            ) : (
              latestPosts.map((post) => {
                const parsed = parsePostExcerpt(post.excerpt);
                return (
                  <article
                    key={post.id || post.title}
                    className="group relative overflow-hidden rounded-2xl border border-white/12 bg-black/55 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/30 hover:shadow-[0_18px_36px_rgba(0,0,0,0.4)]"
                  >
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.07),transparent_45%)]" />
                    {post.cover_url ? (
                      <a href={post.id ? `/posts/${post.id}` : '/posts'}>
                        <img
                          src={post.cover_url}
                          alt={post.title}
                          className="mb-4 h-36 w-full rounded-xl object-cover"
                        />
                      </a>
                    ) : (
                      <div className="mb-4 h-1.5 w-full rounded-full bg-[linear-gradient(90deg,rgba(239,68,68,0.6),rgba(245,158,11,0.45),rgba(59,130,246,0.5))]" />
                    )}

                    <div className="relative">
                      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                        <span className="rounded-full border border-red-300/25 bg-red-300/10 px-2 py-0.5 text-[9px] text-red-200">
                          {post.tag || 'Post'}
                        </span>
                        <span>{post.publish_date || post.created_at || 'Hoje'}</span>
                      </div>

                      <h3 className="mt-3 line-clamp-2 text-lg font-semibold leading-tight text-white">
                        <a href={post.id ? `/posts/${post.id}` : '/posts'}>{post.title}</a>
                      </h3>

                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-zinc-300">
                        {parsed.text}
                      </p>

                      <div className="mt-4 flex items-center gap-2">
                        <a
                          className="inline-flex items-center gap-1 rounded-full border border-yellow-300/35 bg-yellow-300/12 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-yellow-200 transition group-hover:border-yellow-200/70"
                          href={post.id ? `/posts/${post.id}` : '/posts'}
                        >
                          Ler post
                          <span aria-hidden="true">&rarr;</span>
                        </a>
                        {parsed.sourceUrl ? (
                          <a
                            className="inline-flex rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[9px] uppercase tracking-[0.22em] text-zinc-300 transition hover:border-white/35 hover:text-white"
                            href={parsed.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Fonte
                          </a>
                        ) : null}
                      </div>

                      <p className="mt-4 text-[10px] uppercase tracking-[0.28em] text-yellow-300/90">
                        {post.author || 'Equipe CRE'}
                      </p>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
        <section className="grid gap-4 sm:gap-5 lg:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Pilotos",
              desc: "Perfis completos, recordes por pista e evolucao de desempenho.",
              href: "/pilotos",
              icon: "P",
              accent: "from-blue-500/22 via-blue-900/8 to-transparent",
              border: "group-hover:border-blue-300/45",
              glow: "group-hover:shadow-[0_20px_55px_rgba(59,130,246,0.22)]",
            },
            {
              title: "Agenda",
              desc: "Proximas etapas, treinos e eventos com visao mensal e inscricoes.",
              href: "/agendas",
              icon: "A",
              accent: "from-yellow-400/24 via-yellow-900/10 to-transparent",
              border: "group-hover:border-yellow-300/45",
              glow: "group-hover:shadow-[0_20px_55px_rgba(250,204,21,0.2)]",
            },
            {
              title: "Comunidade",
              desc: "Chat, mural e trocas de setup entre pilotos da liga.",
              href: "/comunidades",
              icon: "C",
              accent: "from-red-500/24 via-red-900/10 to-transparent",
              border: "group-hover:border-red-300/45",
              glow: "group-hover:shadow-[0_20px_55px_rgba(239,68,68,0.2)]",
            },
            {
              title: "Suporte",
              desc: "Abra chamados e acompanhe atendimento tecnico da plataforma.",
              href: "/suporte",
              icon: "S",
              accent: "from-emerald-500/24 via-emerald-900/10 to-transparent",
              border: "group-hover:border-emerald-300/45",
              glow: "group-hover:shadow-[0_20px_55px_rgba(16,185,129,0.2)]",
            },
          ].map((card) => (
            <a
              key={card.title}
              href={card.href}
              className={`group relative overflow-hidden rounded-3xl border border-white/12 bg-black/72 p-5 sm:p-6 shadow-[0_14px_36px_rgba(0,0,0,0.42)] transition-all duration-300 hover:-translate-y-0.5 ${card.border} ${card.glow}`}
            >
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.accent}`} />
              <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/5 blur-2xl transition group-hover:bg-white/10" />

              <div className="relative flex h-full flex-col">
                <div className="mb-5 flex items-start justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-black/55 text-sm font-semibold uppercase tracking-[0.24em] text-zinc-100">
                    {card.icon}
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.34em] text-zinc-500">
                    acesso rapido
                  </span>
                </div>

                <h3 className="font-display text-2xl tracking-[0.16em] text-white">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                  {card.desc}
                </p>

                <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-black/45 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-200 transition group-hover:border-white/35 group-hover:text-yellow-100">
                  Abrir secao
                  <span className="transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true">
                    &gt;
                  </span>
                </span>
              </div>
            </a>
          ))}
        </section>
        <section className="rounded-2xl border border-white/10 bg-black/85 p-4 sm:p-6 md:rounded-3xl">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-300">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Live Twitch
              </div>

              <div className="flex items-start gap-4">
                <img
                  src="https://static-cdn.jtvnw.net/jtv_user_pictures/b6ab7cbb-4114-4213-a90f-548513d1269b-profile_image-70x70.png"
                  alt="Canal da live"
                  className="h-14 w-14 rounded-xl border border-white/15 object-cover"
                />
                <div>
                  <h2 className="font-display text-2xl tracking-[0.12em] text-white sm:text-3xl">
                    Vitorcaffe ao vivo
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
                    Corridas, telemetria e leitura de setup em tempo real para a comunidade CRE.
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-zinc-300">
                    <span className="rounded-full border border-white/15 bg-black/40 px-3 py-1">Sim racing</span>
                    <span className="rounded-full border border-white/15 bg-black/40 px-3 py-1">F1</span>
                    <span className="rounded-full border border-white/15 bg-black/40 px-3 py-1">Setup</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex w-full max-w-sm flex-col gap-3 lg:justify-self-end">
              <a
                className="inline-flex items-center justify-center rounded-xl bg-yellow-300 px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-black transition hover:bg-yellow-200"
                href="https://www.twitch.tv/vitorcaffe"
                target="_blank"
                rel="noreferrer"
              >
                Assistir agora
              </a>
              <a
                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-black/40 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-200 transition hover:border-white/35 hover:text-white"
                href="https://www.twitch.tv/vitorcaffe/schedule"
                target="_blank"
                rel="noreferrer"
              >
                Ver agenda da live
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}











