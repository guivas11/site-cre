import { createClient } from "@/lib/supabase/server";
import { ensureUsername } from "@/lib/auth/username";
import TrackLeaders from "./track-leaders";

type LeaderEntry = {
  name: string;
  time: string;
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
        .select("display_name, avatar_url, username")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  const displayName =
    profile?.display_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0];
  const username =
    profile?.username ||
    (user ? await ensureUsername(user.id, user.email) : null);
  const { data: postsData } = await supabase
    .from("posts")
    .select("*")
    .order("publish_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(12);

  const posts = (postsData ?? []) as PostItem[];
  const featured = posts[0] ?? {
    id: "",
    title: "Sem posts ainda",
    excerpt: "Cadastre um post para aparecer aqui.",
    tag: "",
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

  const { data: lapTimes = [] } = await supabase
    .from("lap_times")
    .select("user_id, track, time")
    .limit(500);

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
  lapTimes.forEach((row) => {
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

      <div className="relative mx-auto flex max-w-6xl flex-col gap-16 px-6 pb-24 pt-8">
        <header className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="spark h-14 w-14 rounded-2xl bg-gradient-to-br from-yellow-300 via-orange-500 to-red-600 p-[2px]">
              <div className="flex h-full w-full items-center justify-center rounded-[16px] bg-black/90">
                <img
                  src="/logo-cre.png"
                  alt="CRE Caffé Racing"
                  className="h-10 w-10 object-contain"
                />
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
            <a className="transition hover:text-yellow-300" href="/pilotos">
              Pilotos
            </a>
            <a className="transition hover:text-yellow-300" href="/vitorias">
              Vit?rias
            </a>
            <a className="transition hover:text-yellow-300" href="/agendas">
              Agenda
            </a>
            <a className="transition hover:text-yellow-300" href="/comunidades">
              Comunidade
            </a>
            <a className="transition hover:text-yellow-300" href="/clips">
              Clips
            </a>
          </nav>
          {user ? (
            <div className="hidden items-center gap-3 md:flex">
              <div className="h-9 w-9 overflow-hidden rounded-full border border-white/20 bg-black/60">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-300">
                    {displayName?.slice(0, 2).toUpperCase() || "CRE"}
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400">
                  Logado como
                </p>
                <p className="text-sm text-white">
                  {displayName || "Piloto CRE"}
                </p>
              </div>
              <a
                className="rounded-full border border-yellow-300/50 px-5 py-2 text-xs uppercase tracking-[0.25em] transition hover:border-yellow-300 hover:text-yellow-300"
                href="/dashboard"
              >
                Perfil
              </a>
            </div>
          ) : (
            <a
              className="hidden rounded-full border border-yellow-300/50 px-5 py-2 text-xs uppercase tracking-[0.25em] transition hover:border-yellow-300 hover:text-yellow-300 md:inline-flex"
              href="/login"
            >
              Entrar
            </a>
          )}
        </header>

        <main className="flex flex-col gap-16">
          <section className="grid gap-8 lg:grid-cols-[1.5fr_0.9fr]">
            <div className="glass rounded-3xl p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-yellow-300 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-black">
                  Destaque
                </span>
                <span className="text-xs uppercase tracking-[0.3em] text-blue-200">
                  {featured.publish_date
                    ? new Date(featured.publish_date).toLocaleDateString("pt-BR")
                    : ""}
                </span>
                {featured.tag ? (
                  <span className="rounded-full border border-white/15 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-zinc-200">
                    {featured.tag}
                  </span>
                ) : null}
              </div>

              {featured.cover_url ? (
                <a
                  href={featured.id ? `/posts/${featured.id}` : "/posts"}
                  className="group relative mt-5 block overflow-hidden rounded-3xl border border-white/10 bg-black/40"
                >
                  <img
                    src={featured.cover_url}
                    alt={featured.title}
                    className="h-56 w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </a>
              ) : null}

              <h1 className="mt-6 font-display text-4xl tracking-[0.08em] sm:text-5xl">
                {featured.title}
              </h1>
              <div className="relative mt-3 max-w-3xl">
                <p className="text-sm leading-relaxed text-zinc-300 whitespace-pre-line max-h-28 overflow-hidden">{featured.excerpt}</p>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/80 to-transparent" />
              </div>
              <div className="mt-4">
                <a
                  className="text-xs uppercase tracking-[0.3em] text-yellow-300 transition hover:text-yellow-200"
                  href={featured.id ? `/posts/${featured.id}` : "/posts"}
                >
                  Continuar lendo &gt;
                </a>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-zinc-400">
                <span>Assinado por {featured.author || "Equipe CRE"}</span>
                <span className="h-1 w-1 rounded-full bg-zinc-500" />
                <span>Leitura rapida: {featured.read_time ?? "5 min"}</span>
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-[0_12px_30px_-18px_rgba(37,99,235,0.9)]"
                  href={featured.id ? `/posts/${featured.id}` : "/posts"}
                >
                  Ler agora
                </a>
                <a
                  className="rounded-full border border-red-500/60 px-6 py-3 text-sm uppercase tracking-[0.2em] text-red-200 transition hover:-translate-y-0.5 hover:border-red-400 hover:text-red-100 hover:shadow-[0_12px_30px_-18px_rgba(239,68,68,0.7)]"
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
                  Ranking de tempos
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.3em] text-zinc-400">
                  Melhor tempo por pista
                </p>
                <div className="mt-4">
                  <TrackLeaders tracks={trackLeaders} />
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
                {latestPosts.map((post) => (
                  <article
                    key={post.id || post.title}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-white/25"
                  >
                    {post.cover_url ? (
                      <a href={post.id ? `/posts/${post.id}` : "/posts"}>
                        <img
                          src={post.cover_url}
                          alt={post.title}
                          className="mb-4 h-36 w-full rounded-2xl object-cover"
                        />
                      </a>
                    ) : null}
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em]">
                      <span className="rounded-full bg-red-600/80 px-3 py-1 text-[10px] text-white">
                        {post.tag}
                      </span>
                      <span className="text-zinc-400">
                        {post.publish_date
                          ? new Date(post.publish_date).toLocaleDateString("pt-BR")
                          : ""}
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-white">
                      <a href={post.id ? `/posts/${post.id}` : "/posts"}>{post.title}</a>
                    </h3>
                                        <div className="relative mt-3 rounded-2xl border border-white/10 bg-black/40 p-4">
                      <p className="text-sm leading-relaxed text-zinc-200 whitespace-pre-line max-h-24 overflow-hidden">{post.excerpt}</p>
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/80 to-transparent" />
                    </div>
                    <a
                      className="mt-3 inline-flex text-[10px] uppercase tracking-[0.3em] text-yellow-300 transition hover:text-yellow-200"
                      href={post.id ? `/posts/${post.id}` : "/posts"}
                    >
                      Continuar lendo &gt;
                    </a>
                    <p className="mt-4 text-xs uppercase tracking-[0.3em] text-yellow-300">
                      {post.author || "Equipe CRE"}
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

            <div className="relative overflow-hidden rounded-3xl border border-purple-500/40 bg-gradient-to-br from-[#1b0f2e] via-black to-[#0b0b0b] p-6 shadow-[0_0_45px_rgba(168,85,247,0.25)] sm:p-8">
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl" />
              <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-purple-200">
                    Twitch Live
                  </p>
                  <span className="flex items-center gap-2 rounded-full border border-red-500/50 bg-red-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-red-300">
                    <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                    Ao vivo
                  </span>
                </div>

                <div className="mt-5 flex items-center gap-4">
                  <div className="relative">
                    <div className="h-16 w-16 overflow-hidden rounded-2xl border border-purple-500/40 bg-black">
                      <img
                        src="https://static-cdn.jtvnw.net/jtv_user_pictures/b6ab7cbb-4114-4213-a90f-548513d1269b-profile_image-70x70.png"
                        alt="Twitch"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.9)]" />
                  </div>
                  <div>
                    <p className="font-display text-2xl tracking-[0.18em] text-white">
                      VITORCAFFE
                    </p>
                    <p className="text-xs uppercase tracking-[0.35em] text-purple-200">
                      Corridas · Setups · Bastidores
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <a
                    className="inline-flex rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] transition hover:brightness-110"
                    href="https://www.twitch.tv/vitorcaffe"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Assistir live
                  </a>
                  <div className="text-xs uppercase tracking-[0.35em] text-zinc-400">
                    Notificações ativas
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}




