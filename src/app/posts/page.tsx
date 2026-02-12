import { createClient } from "@/lib/supabase/server";
import { createPost, deletePost, updatePost } from "./actions";
import UploadField from "@/app/dashboard/UploadField";
import PostLikeButton from "./PostLikeButton";
import { parsePostExcerpt } from "@/lib/posts/excerpt";

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

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

type PageProps = {
  searchParams?: { error?: string; success?: string };
};

export default async function PostsPage({ searchParams }: PageProps) {
  const supabase = await createClient();

  const { data: postsData } = await supabase
    .from("posts")
    .select("*")
    .order("publish_date", { ascending: false })
    .order("created_at", { ascending: false });

  const posts = (postsData ?? []) as PostItem[];

  const { data: userData } = await supabase.auth.getUser();
  const isLogged = Boolean(userData.user);
  const adminUserId = userData.user?.id ?? "";
  const currentUserId = userData.user?.id ?? null;

  const { data: adminProfile } = userData.user
    ? await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", userData.user.id)
        .maybeSingle()
    : { data: null };

  const isAdmin = Boolean(adminProfile?.is_admin);

  const { data: likesData } = await supabase
    .from("post_likes")
    .select("post_id,user_id");

  const likeCountByPost = new Map<string, number>();
  const likedPostIds = new Set<string>();

  (likesData ?? []).forEach((like) => {
    likeCountByPost.set(
      like.post_id,
      (likeCountByPost.get(like.post_id) ?? 0) + 1,
    );
    if (currentUserId && like.user_id === currentUserId) {
      likedPostIds.add(like.post_id);
    }
  });

  const messageError =
    typeof searchParams?.error === "string" ? searchParams.error : "";
  const messageSuccess =
    typeof searchParams?.success === "string" ? searchParams.success : "";

  const featured = posts[0] ?? null;
  const feed = featured ? posts.slice(1) : posts;
  const featuredParsed = parsePostExcerpt(featured?.excerpt);

  return (
    <div className="min-h-screen racing-bg text-white">
      <div className="absolute inset-0 track-grid opacity-35" />
      <div className="absolute inset-0 scanline opacity-15" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-7 px-4 pb-24 pt-6 md:gap-8 md:px-6 md:pt-8">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-yellow-300">
              Blog CRE
            </p>
            <h1 className="font-display text-4xl tracking-[0.12em] sm:text-5xl">
              Ultimos posts
            </h1>
            <p className="mt-3 max-w-xl text-sm text-zinc-300">
              Noticias, bastidores e analises da cena de automobilismo da CRE.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-zinc-300">
              <span className="rounded-full border border-white/15 bg-black/45 px-3 py-1">
                {posts.length} posts
              </span>
              <span className="rounded-full border border-white/15 bg-black/45 px-3 py-1">
                {feed.length} no feed
              </span>
              <span className="rounded-full border border-yellow-300/35 bg-yellow-300/10 px-3 py-1 text-yellow-200">
                Atualizado diariamente
              </span>
            </div>
          </div>
          <a
            className="rounded-full border border-white/20 px-5 py-3 text-xs uppercase tracking-[0.25em] text-zinc-200 transition hover:border-white/50 hover:text-white"
            href="/"
          >
            Voltar para a home
          </a>
        </header>

        {messageError ? (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {messageError}
          </div>
        ) : null}

        {messageSuccess ? (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {messageSuccess}
          </div>
        ) : null}

        {featured ? (
          <section className="glass overflow-hidden rounded-3xl border border-white/15 shadow-[0_24px_65px_rgba(0,0,0,0.42)]">
            <div className="primary-stripe h-1.5" />
            <article className="grid gap-0 md:grid-cols-[1.05fr_0.95fr]">
              <div className="p-6 sm:p-8 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(0,0,0,0))]">
                <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-zinc-300">
                  <span className="rounded-full bg-blue-600 px-3 py-1 text-[10px] text-white">
                    {featured.tag}
                  </span>
                  <span>{formatDate(featured.publish_date || featured.created_at || "")}</span>
                  {featured.read_time ? <span>• {featured.read_time}</span> : null}
                </div>

                <h2 className="mt-4 font-display text-3xl tracking-[0.08em] sm:text-4xl">
                  <a
                    href={featured.id ? `/posts/${featured.id}` : "/posts"}
                    className="transition hover:text-yellow-200"
                  >
                    {featured.title}
                  </a>
                </h2>

                <p className="mt-4 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-zinc-200">
                  {featuredParsed.text.length > 360
                    ? `${featuredParsed.text.slice(0, 360)}...`
                    : featuredParsed.text}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <a
                    href={featured.id ? `/posts/${featured.id}` : "/posts"}
                    className="rounded-full bg-blue-600 px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-blue-500"
                  >
                    Ler materia
                  </a>
                  {featuredParsed.sourceUrl ? (
                    <a
                      href={featuredParsed.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-zinc-300 transition hover:border-white/40 hover:text-white"
                    >
                      Fonte
                    </a>
                  ) : null}
                  <p className="text-xs uppercase tracking-[0.3em] text-yellow-300">
                    {featured.author || "Equipe CRE"}
                  </p>
                  <PostLikeButton
                    postId={featured.id}
                    initialCount={likeCountByPost.get(featured.id) ?? 0}
                    initialLiked={likedPostIds.has(featured.id)}
                    userId={currentUserId}
                  />
                </div>
              </div>

              <div className="border-t border-white/10 md:border-l md:border-t-0">
                {featured.cover_url ? (
                  <a href={featured.id ? `/posts/${featured.id}` : "/posts"}>
                    <img
                      src={featured.cover_url}
                      alt={featured.title}
                      className="h-64 w-full object-cover md:h-full"
                    />
                  </a>
                ) : (
                  <div className="flex h-64 items-center justify-center bg-black/40 text-xs uppercase tracking-[0.3em] text-zinc-500 md:h-full">
                    Sem capa
                  </div>
                )}
              </div>
            </article>
          </section>
        ) : (
          <section className="glass rounded-3xl p-8">
            <p className="text-sm text-zinc-400">Nenhum post cadastrado.</p>
          </section>
        )}
        <section className="glass rounded-3xl border border-white/10 p-4 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-2xl tracking-[0.14em] text-white">
              Feed de noticias
            </h2>
            <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">
              {feed.length} publicacoes
            </span>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {feed.map((post) => {
              const parsed = parsePostExcerpt(post.excerpt);
              return (
                <article
                  key={post.id}
                  className="group relative overflow-hidden rounded-2xl border border-white/12 bg-black/55 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-white/30 hover:shadow-[0_18px_36px_rgba(0,0,0,0.42)]"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_50%)]" />
                  {post.cover_url ? (
                    <a href={post.id ? `/posts/${post.id}` : "/posts"}>
                      <img
                        src={post.cover_url}
                        alt={post.title}
                        className="h-44 w-full rounded-xl object-cover"
                      />
                    </a>
                  ) : (
                    <div className="flex h-44 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-xs uppercase tracking-[0.3em] text-zinc-500">
                      Sem capa
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-zinc-400">
                    <span className="rounded-full border border-blue-400/30 bg-blue-500/15 px-2.5 py-1 text-[10px] text-blue-100">
                      {post.tag}
                    </span>
                    <span>{formatDate(post.publish_date || post.created_at || "")}</span>
                    {post.read_time ? <span>- {post.read_time}</span> : null}
                  </div>

                  <h3 className="mt-3 line-clamp-2 text-xl font-semibold text-white">
                    <a href={post.id ? `/posts/${post.id}` : "/posts"}>{post.title}</a>
                  </h3>

                  <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-zinc-300">
                    {parsed.text}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.3em] text-yellow-300">
                      {post.author || "Equipe CRE"}
                    </p>
                    <PostLikeButton
                      postId={post.id}
                      initialCount={likeCountByPost.get(post.id) ?? 0}
                      initialLiked={likedPostIds.has(post.id)}
                      userId={currentUserId}
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <a
                      className="inline-flex items-center gap-2 rounded-full border border-yellow-300/35 bg-yellow-300/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-yellow-200 transition hover:border-yellow-200/70 hover:bg-yellow-300/20 hover:text-yellow-100"
                      href={post.id ? `/posts/${post.id}` : "/posts"}
                    >
                      Ler post <span aria-hidden="true">&rarr;</span>
                    </a>
                    {parsed.sourceUrl ? (
                      <a
                        className="inline-flex rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[9px] uppercase tracking-[0.24em] text-zinc-300 transition hover:border-white/35 hover:text-white"
                        href={parsed.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Fonte
                      </a>
                    ) : null}
                  </div>

                  {isAdmin ? (
                    <details className="mt-5 border-t border-white/10 pt-4">
                      <summary className="cursor-pointer text-xs uppercase tracking-[0.3em] text-yellow-300">
                        Editar
                      </summary>
                      <form className="mt-3 grid gap-3" action={updatePost}>
                        <input type="hidden" name="id" value={post.id} />
                        <UploadField
                          label="Capa do post"
                          name="cover_url"
                          bucket="post-covers"
                          userId={adminUserId}
                          defaultValue={post.cover_url}
                        />
                        <input
                          className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                          name="title"
                          defaultValue={post.title}
                        />
                        <input
                          className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                          name="tag"
                          defaultValue={post.tag}
                          placeholder="Tag"
                        />
                        <input
                          className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                          name="author"
                          defaultValue={post.author ?? ""}
                          placeholder="Autor"
                        />
                        <input
                          className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                          name="read_time"
                          defaultValue={post.read_time ?? ""}
                          placeholder="Tempo de leitura"
                        />
                        <input
                          className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                          name="date"
                          defaultValue={post.publish_date ?? ""}
                          placeholder="Data (YYYY-MM-DD)"
                        />
                        <textarea
                          className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                          name="excerpt"
                          rows={3}
                          defaultValue={parsed.text}
                          placeholder="Resumo"
                        />
                        <div className="flex items-center gap-3">
                          <button
                            type="submit"
                            className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.3em] text-zinc-200 transition hover:border-white/50 hover:text-white"
                          >
                            Salvar
                          </button>
                          <button
                            formAction={deletePost}
                            className="rounded-full border border-red-500/40 px-4 py-2 text-xs uppercase tracking-[0.3em] text-red-200 transition hover:border-red-500/70"
                          >
                            Remover
                          </button>
                        </div>
                      </form>
                    </details>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>

        {isAdmin ? (
          <section className="glass rounded-2xl p-4 md:rounded-3xl md:p-6">
            <h2 className="text-sm uppercase tracking-[0.4em] text-yellow-300">
              Criar novo post
            </h2>
            <form className="mt-5 grid gap-4" action={createPost}>
              <UploadField
                label="Capa do post"
                name="cover_url"
                bucket="post-covers"
                userId={adminUserId}
              />
              <input
                className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                name="title"
                placeholder="Titulo"
                required
              />
              <input
                className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                name="tag"
                placeholder="Tag"
                required
              />
              <input
                className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                name="author"
                placeholder="Autor"
              />
              <input
                className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                name="read_time"
                placeholder="Tempo de leitura (ex: 5 min)"
              />
              <input
                className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                name="date"
                placeholder="Data (YYYY-MM-DD)"
              />
              <textarea
                className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                name="excerpt"
                rows={3}
                placeholder="Resumo"
                required
              />
              <button
                type="submit"
                className="rounded-full border border-white/20 px-5 py-3 text-xs uppercase tracking-[0.3em] text-zinc-200 transition hover:border-white/50 hover:text-white"
              >
                Criar post
              </button>
            </form>
          </section>
        ) : isLogged ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-400">
            Apenas administradores podem editar os posts.
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-400">
            Faca login para ver mais detalhes dos posts.
          </div>
        )}
      </div>
    </div>
  );
}

