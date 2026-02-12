import { createClient } from "@/lib/supabase/server";
import { parsePostExcerpt } from "@/lib/posts/excerpt";

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

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

type PageProps = {
  searchParams?: { q?: string };
};

export default async function NoticiasPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const q = String(searchParams?.q ?? "").trim().toLowerCase();

  const { data: postsData } = await supabase
    .from("posts")
    .select("id,title,excerpt,tag,author,read_time,publish_date,created_at,cover_url")
    .order("publish_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(120);

  const posts = ((postsData ?? []) as PostItem[])
    .map((post) => ({ ...post, parsed: parsePostExcerpt(post.excerpt) }))
    .filter((post) => {
      if (!q) return true;
      return [post.title, post.parsed.text, post.tag, post.author ?? ""].join(" ").toLowerCase().includes(q);
    });

  return (
    <div className="min-h-screen racing-bg text-white">
      <div className="absolute inset-0 track-grid opacity-35" />
      <div className="absolute inset-0 scanline opacity-15" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-7 px-4 pb-24 pt-6 md:gap-8 md:px-6 md:pt-8">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-yellow-300">Centro de noticias</p>
            <h1 className="font-display text-4xl tracking-[0.12em] sm:text-5xl">Noticias curadas</h1>
          </div>
          <a href="/" className="rounded-full border border-white/20 px-5 py-3 text-xs uppercase tracking-[0.25em] text-zinc-200 transition hover:border-white/50 hover:text-white">Voltar para home</a>
        </header>

        <section className="glass rounded-2xl p-4 md:rounded-3xl md:p-6">
          <form action="/noticias" method="get" className="flex gap-3">
            <input
              type="search"
              name="q"
              defaultValue={q}
              className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
              placeholder="Buscar noticia"
            />
            <button className="rounded-2xl border border-yellow-300/50 bg-yellow-300/10 px-5 py-3 text-xs uppercase tracking-[0.3em] text-yellow-100" type="submit">Buscar</button>
          </form>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          {posts.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-400">Nenhuma noticia encontrada.</p>
          ) : (
            posts.map((post) => (
              <article key={post.id} className="glass rounded-3xl overflow-hidden">
                {post.cover_url ? (
                  <img src={post.cover_url} alt={post.title} className="h-44 w-full object-cover" />
                ) : null}
                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.3em] text-zinc-400">
                    <span className="rounded-full border border-white/15 bg-black/40 px-3 py-1">{post.tag || "F1"}</span>
                    <span>{formatDate(post.publish_date || post.created_at)}</span>
                    {post.read_time ? <span>{post.read_time}</span> : null}
                  </div>
                  <h2 className="mt-3 text-xl font-semibold text-white">{post.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-300 line-clamp-5">{post.parsed.text}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <a href={`/posts/${post.id}`} className="inline-flex items-center gap-2 rounded-full border border-yellow-300/40 bg-yellow-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-yellow-100 transition hover:bg-yellow-300/20">Abrir post <span aria-hidden="true">?</span></a>
                    {post.parsed.sourceUrl ? (
                      <a href={post.parsed.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-zinc-300 transition hover:border-white/30 hover:text-white">Fonte</a>
                    ) : null}
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </div>
  );
}

