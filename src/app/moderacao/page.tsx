import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { setUserBan, toggleCommentHidden, togglePostHidden } from "./actions";

type PageProps = {
  searchParams?: { error?: string; success?: string };
};

export const dynamic = "force-dynamic";

export default async function ModeracaoPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    redirect("/");
  }

  const { data: postsData } = await supabase
    .from("posts")
    .select("id,title,author,is_hidden,created_at")
    .order("created_at", { ascending: false })
    .limit(30);

  const { data: commentsData } = await supabase
    .from("post_comments")
    .select("id,post_id,user_id,display_name,username,content,is_hidden,created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  const { data: usersData } = await supabase
    .from("profiles")
    .select("id,email,username,display_name,is_admin,is_banned,ban_reason,banned_at,created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  const posts = postsData ?? [];
  const comments = commentsData ?? [];
  const users = usersData ?? [];

  const error = typeof searchParams?.error === "string" ? searchParams.error : "";
  const success = typeof searchParams?.success === "string" ? searchParams.success : "";

  return (
    <div className="min-h-screen racing-bg text-white">
      <div className="absolute inset-0 track-grid opacity-35" />
      <div className="absolute inset-0 scanline opacity-15" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-7 px-4 pb-24 pt-6 md:gap-8 md:px-6 md:pt-8">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-yellow-300">Admin</p>
            <h1 className="font-display text-4xl tracking-[0.12em]">Moderacao</h1>
          </div>
          <a
            href="/"
            className="rounded-full border border-white/20 px-5 py-3 text-xs uppercase tracking-[0.25em] text-zinc-200 transition hover:border-white/45 hover:text-white"
          >
            Voltar para home
          </a>
        </header>

        {error ? (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {success}
          </div>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="glass rounded-2xl p-4 md:rounded-3xl md:p-6">
            <h2 className="text-sm uppercase tracking-[0.35em] text-yellow-300">Posts</h2>
            <div className="mt-4 grid gap-3">
              {posts.map((post) => (
                <div key={post.id} className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-white">{post.title}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.25em] text-zinc-500">
                        {post.author || "Equipe CRE"}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.2em] ${
                        post.is_hidden
                          ? "border border-red-400/40 bg-red-500/15 text-red-200"
                          : "border border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
                      }`}
                    >
                      {post.is_hidden ? "Oculto" : "Visivel"}
                    </span>
                  </div>
                  <form className="mt-3" action={togglePostHidden}>
                    <input type="hidden" name="post_id" value={post.id} />
                    <input
                      type="hidden"
                      name="next_hidden"
                      value={post.is_hidden ? "false" : "true"}
                    />
                    <button
                      type="submit"
                      className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.25em] text-zinc-200 transition hover:border-white/45"
                    >
                      {post.is_hidden ? "Reexibir" : "Ocultar"}
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-4 md:rounded-3xl md:p-6">
            <h2 className="text-sm uppercase tracking-[0.35em] text-yellow-300">Comentarios</h2>
            <div className="mt-4 grid gap-3">
              {comments.map((comment) => (
                <div key={comment.id} className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-zinc-400">
                    {(comment.display_name || "Piloto CRE") + (comment.username ? ` @${comment.username}` : "")}
                  </p>
                  <p className="mt-2 text-sm text-zinc-200 line-clamp-3">{comment.content}</p>
                  <form className="mt-3" action={toggleCommentHidden}>
                    <input type="hidden" name="comment_id" value={comment.id} />
                    <input
                      type="hidden"
                      name="next_hidden"
                      value={comment.is_hidden ? "false" : "true"}
                    />
                    <button
                      type="submit"
                      className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.25em] text-zinc-200 transition hover:border-white/45"
                    >
                      {comment.is_hidden ? "Reexibir" : "Ocultar"}
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="glass rounded-2xl p-4 md:rounded-3xl md:p-6">
          <h2 className="text-sm uppercase tracking-[0.35em] text-yellow-300">Usuarios</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {users.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="text-sm text-white">{item.display_name || item.username || "Piloto"}</p>
                <p className="mt-1 text-xs text-zinc-400">{item.email || "sem email"}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.is_admin ? (
                    <span className="rounded-full border border-blue-400/40 bg-blue-500/15 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-blue-200">
                      Admin
                    </span>
                  ) : null}
                  {item.is_banned ? (
                    <span className="rounded-full border border-red-400/40 bg-red-500/15 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-red-200">
                      Banido
                    </span>
                  ) : (
                    <span className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-emerald-200">
                      Ativo
                    </span>
                  )}
                </div>
                <form className="mt-3 grid gap-2" action={setUserBan}>
                  <input type="hidden" name="user_id" value={item.id} />
                  <input
                    type="hidden"
                    name="next_ban"
                    value={item.is_banned ? "false" : "true"}
                  />
                  <input
                    name="reason"
                    placeholder="Motivo do bloqueio"
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs text-white placeholder:text-zinc-500"
                    defaultValue={item.ban_reason || ""}
                  />
                  <button
                    type="submit"
                    className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.25em] text-zinc-200 transition hover:border-white/45"
                  >
                    {item.is_banned ? "Remover ban" : "Banir usuario"}
                  </button>
                </form>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

