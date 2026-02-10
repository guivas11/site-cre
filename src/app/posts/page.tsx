import { createClient } from "@/lib/supabase/server";
import { createPost, deletePost, updatePost } from "./actions";
import UploadField from "@/app/dashboard/UploadField";
import PostLikeButton from "./PostLikeButton";

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

        <section className="glass rounded-3xl overflow-hidden">
          <div className="primary-stripe h-2" />
          <div className="grid gap-5 p-6 sm:p-8 md:grid-cols-2">
            {posts.length === 0 ? (
              <p className="text-sm text-zinc-400">Nenhum post cadastrado.</p>
            ) : (
              posts.map((post) => (
                <article
                  key={post.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-white/25"
                >
                  {post.cover_url ? (
                    <a href={post.id ? `/posts/${post.id}` : "/posts"}>
                      <img
                        src={post.cover_url}
                        alt={post.title}
                        className="mb-4 h-40 w-full rounded-2xl object-cover"
                      />
                    </a>
                  ) : null}
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em]">
                    <span className="rounded-full bg-blue-600 px-3 py-1 text-[10px] text-white">
                      {post.tag}
                    </span>
                    <span className="text-zinc-400">
                      {formatDate(post.publish_date || post.created_at || "")}
                    </span>
                    {post.read_time ? (
                      <span className="text-zinc-500">? {post.read_time}</span>
                    ) : null}
                  </div>
                  <h2 className="mt-3 text-lg font-semibold text-white">
                    <a href={post.id ? `/posts/${post.id}` : "/posts"}>{post.title}</a>
                  </h2>
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
                    Continuar lendo &gt;
                  </a>
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

                  {isAdmin ? (
                    <details className="mt-4">
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
                          defaultValue={post.excerpt}
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
              ))
            )}
          </div>
        </section>

        {isAdmin ? (
          <section className="glass rounded-3xl p-6">
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
            Faça login para ver mais detalhes dos posts.
          </div>
        )}
      </div>
    </div>
  );
}

