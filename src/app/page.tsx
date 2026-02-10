import { createClient } from "@/lib/supabase/server";
import { ensureUsername } from "@/lib/auth/username";
import TrackLeaders from "./track-leaders";

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

      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-24 pt-10">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-yellow-300/40 bg-yellow-300/10">
              <img src="/logo-cre.png" alt="CRE" className="h-8 w-8" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-yellow-300">
                Caffé Racing
              </p>
              <h1 className="font-display text-2xl tracking-[0.25em]">
                Blog dos pilotos
              </h1>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-6 text-xs uppercase tracking-[0.35em] text-zinc-400">
            <a className="transition hover:text-yellow-300" href="/pilotos">
              Pilotos
            </a>
            <a className="transition hover:text-yellow-300" href="/vitorias">
              Vitórias
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

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 rounded-full border border-white/15 bg-black/40 px-4 py-2">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Perfil"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/5 text-xs uppercase">
                    {displayName?.slice(0, 1) || "C"}
                  </div>
                )}
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400">
                    Logado como
                  </p>
                  <p className="text-sm text-white">
                    {displayName || "Piloto CRE"}
                  </p>
                </div>
                <a
                  className="rounded-full border border-yellow-300/40 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-yellow-200 transition hover:border-yellow-300 hover:bg-yellow-300/10"
                  href="/dashboard"
                >
                  Perfil
                </a>
              </div>
            ) : (
              <a
                className="rounded-full border border-white/20 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-zinc-200 transition hover:border-yellow-300 hover:text-yellow-200"
                href="/login"
              >
                Entrar
              </a>
            )}
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="glass rounded-3xl p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.3em] text-zinc-400">
              <span className="rounded-full bg-yellow-300 px-3 py-1 text-[10px] text-black">
                Post em destaque
              </span>
              <span>
                {featured.publish_date || featured.created_at || "Hoje"}
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1 text-[10px]">
                Bem-vindos
              </span>
            </div>

            {featured.cover_url ? (
              <img
                src={featured.cover_url}
                alt={featured.title}
                className="mt-6 h-56 w-full rounded-3xl object-cover"
              />
            ) : null}

            <h1 className="mt-6 font-display text-4xl tracking-[0.18em] sm:text-5xl">
              {featured.title}
            </h1>
            <div className="relative mt-3 max-w-3xl">
              <p className="text-sm leading-relaxed text-zinc-300 whitespace-pre-line max-h-28 overflow-hidden">
                {featured.excerpt}
              </p>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/80 to-transparent" />
            </div>
            <div className="mt-4">
              <a
                className="text-xs uppercase tracking-[0.3em] text-yellow-300 transition hover:text-yellow-200"
                href={featured.id ? `/posts/${featured.id}` : "/posts"}
              >
                Continuar lendo >
              </a>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-zinc-400">
              <span>Assinado por {featured.author || "Equipe CRE"}</span>
              <span className="h-1 w-1 rounded-full bg-zinc-500" />
              <span>Leitura rápida: {featured.read_time ?? "5 min"}</span>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-blue-500"
                href={featuredLink}
              >
                Abrir matéria
              </a>
              <a
                className="rounded-full border border-red-400/40 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-red-200 transition hover:border-red-300 hover:text-red-100"
                href="/posts"
              >
                Ver todos os posts
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="glass rounded-3xl p-6">
              <h2 className="text-xs uppercase tracking-[0.4em] text-yellow-300">
                Categorias
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {categories.length === 0 ? (
                  <p className="text-sm text-zinc-400">
                    Nenhuma categoria ainda.
                  </p>
                ) : (
                  categories.map((category) => (
                    <span
                      key={category}
                      className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-zinc-300"
                    >
                      {category}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="glass rounded-3xl p-6">
              <h2 className="text-xs uppercase tracking-[0.4em] text-red-300">
                Ranking de tempos
              </h2>
              <p className="mt-2 text-xs uppercase tracking-[0.35em] text-zinc-400">
                Melhor tempo por pista
              </p>
              <div className="mt-4">
                <TrackLeaders leaders={trackLeaders} />
              </div>
              <p className="mt-4 text-[10px] uppercase tracking-[0.35em] text-zinc-500">
                Próxima pista em instantes
              </p>
            </div>
          </div>
        </section>

        <section className="glass rounded-3xl p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl tracking-[0.18em]">
              Últimos posts
            </h2>
            <span className="text-xs uppercase tracking-[0.3em] text-zinc-400">
              Atualizado diariamente
            </span>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {latestPosts.length === 0 ? (
              <p className="text-sm text-zinc-400">
                Nenhum post cadastrado ainda.
              </p>
            ) : (
              latestPosts.map((post) => (
                <div
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
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-zinc-400">
                    <span className="rounded-full bg-red-500/10 px-3 py-1 text-[10px] text-red-200">
                      {post.tag || "Post"}
                    </span>
                    <span>{post.publish_date || post.created_at || "Hoje"}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-white">
                    <a href={post.id ? `/posts/${post.id}` : "/posts"}>
                      {post.title}
                    </a>
                  </h3>
                  <div className="relative mt-3 rounded-2xl border border-white/10 bg-black/40 p-4">
                    <p className="text-sm leading-relaxed text-zinc-200 whitespace-pre-line max-h-24 overflow-hidden">
                      {post.excerpt}
                    </p>
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/80 to-transparent" />
                  </div>
                  <a
                    className="mt-3 inline-flex text-[10px] uppercase tracking-[0.3em] text-yellow-300 transition hover:text-yellow-200"
                    href={post.id ? `/posts/${post.id}` : "/posts"}
                  >
                    Continuar lendo >
                  </a>
                  <p className="mt-4 text-xs uppercase tracking-[0.3em] text-yellow-300">
                    {post.author || "Equipe CRE"}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
