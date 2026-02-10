import { createClient } from "@/lib/supabase/server";
import PostLikeButton from "../PostLikeButton";

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

function splitParagraphs(text: string) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return [];
  if (text.includes("\n")) {
    return text
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
  }
  const sentences = cleaned.split(/(?<=[.!?])\s+/);
  const paragraphs: string[] = [];
  for (let i = 0; i < sentences.length; i += 2) {
    paragraphs.push(sentences.slice(i, i + 2).join(" "));
  }
  return paragraphs;
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
  params: { id?: string };
};

export default async function PostPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams?.id;

  if (!id || id === "undefined") {
    return (
      <div className="min-h-screen racing-bg text-white">
        <div className="absolute inset-0 track-grid opacity-35" />
        <div className="absolute inset-0 scanline opacity-15" />
        <div className="relative mx-auto flex max-w-3xl flex-col gap-6 px-6 pb-24 pt-8">
          <a
            href="/posts"
            className="text-xs uppercase tracking-[0.3em] text-zinc-400 transition hover:text-white"
          >
            Voltar para posts
          </a>
          <div className="glass rounded-3xl p-6">
            <h1 className="font-display text-2xl tracking-[0.12em]">
              Erro ao carregar o post
            </h1>
            <p className="mt-3 text-sm text-zinc-300">
              Identificador do post inválido.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const currentUserId = userData.user?.id ?? null;
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return (
      <div className="min-h-screen racing-bg text-white">
        <div className="absolute inset-0 track-grid opacity-35" />
        <div className="absolute inset-0 scanline opacity-15" />
        <div className="relative mx-auto flex max-w-3xl flex-col gap-6 px-6 pb-24 pt-8">
          <a
            href="/posts"
            className="text-xs uppercase tracking-[0.3em] text-zinc-400 transition hover:text-white"
          >
            Voltar para posts
          </a>
          <div className="glass rounded-3xl p-6">
            <h1 className="font-display text-2xl tracking-[0.12em]">
              Erro ao carregar o post
            </h1>
            <p className="mt-3 text-sm text-zinc-300">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen racing-bg text-white">
        <div className="absolute inset-0 track-grid opacity-35" />
        <div className="absolute inset-0 scanline opacity-15" />
        <div className="relative mx-auto flex max-w-3xl flex-col gap-6 px-6 pb-24 pt-8">
          <a
            href="/posts"
            className="text-xs uppercase tracking-[0.3em] text-zinc-400 transition hover:text-white"
          >
            Voltar para posts
          </a>
          <div className="glass rounded-3xl p-6">
            <h1 className="font-display text-2xl tracking-[0.12em]">
              Post não encontrado
            </h1>
            <p className="mt-3 text-sm text-zinc-300">
              Não foi possível encontrar o post solicitado.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const post = data as PostItem;

  const { data: likeRows } = await supabase
    .from("post_likes")
    .select("user_id")
    .eq("post_id", id);

  const likeCount = likeRows?.length ?? 0;
  const likedByUser = currentUserId
    ? (likeRows ?? []).some((row) => row.user_id === currentUserId)
    : false;

  return (
    <div className="min-h-screen racing-bg text-white">
      <div className="absolute inset-0 track-grid opacity-35" />
      <div className="absolute inset-0 scanline opacity-15" />

      <div className="relative mx-auto flex max-w-4xl flex-col gap-8 px-6 pb-24 pt-8">
        <a
          href="/posts"
          className="text-xs uppercase tracking-[0.3em] text-zinc-400 transition hover:text-white"
        >
          Voltar para posts
        </a>

        <div className="glass rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-zinc-400">
            <span className="rounded-full bg-blue-600 px-3 py-1 text-[10px] text-white">
              {post.tag}
            </span>
            <span>{formatDate(post.publish_date || post.created_at || "")}</span>
            {post.read_time ? <span>· {post.read_time}</span> : null}
          </div>

          <h1 className="mt-4 font-display text-4xl tracking-[0.1em] sm:text-5xl">
            {post.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <p className="text-sm uppercase tracking-[0.3em] text-yellow-300">
              {post.author || "Equipe CRE"}
            </p>
            <PostLikeButton
              postId={post.id}
              initialCount={likeCount}
              initialLiked={likedByUser}
              userId={currentUserId}
            />
          </div>

          {post.cover_url ? (
            <img
              src={post.cover_url}
              alt={post.title}
              className="mt-6 h-72 w-full rounded-3xl object-cover"
            />
          ) : null}

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-5 text-base leading-relaxed text-zinc-200">
            {splitParagraphs(post.excerpt).map((paragraph, index) => (
              <p key={index} className="mb-4 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}