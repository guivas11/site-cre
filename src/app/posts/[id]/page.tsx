import { createClient } from "@/lib/supabase/server";
import PostLikeButton from "../PostLikeButton";
import PostComments from "../PostComments";

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

function parseExcerpt(rawText: string) {
  const normalized = rawText.replace(/\\n/g, "\n").trim();
  const sourceMatch = normalized.match(/(?:^|\n)Fonte:\s*(https?:\/\/\S+)/i);
  const sourceUrl = sourceMatch?.[1] ?? null;
  const textWithoutSource = sourceMatch
    ? normalized.replace(sourceMatch[0], "").trim()
    : normalized;

  return {
    sourceUrl,
    paragraphs: splitParagraphs(textWithoutSource),
  };
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
  is_hidden?: boolean;
};

type PageProps = {
  params: Promise<{ id?: string }> | { id?: string };
};

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen racing-bg text-white">
      <div className="absolute inset-0 track-grid opacity-35" />
      <div className="absolute inset-0 scanline opacity-15" />
      <div className="relative mx-auto flex max-w-3xl flex-col gap-6 px-4 pb-24 pt-6 md:px-6 md:pt-8">
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
          <p className="mt-3 text-sm text-zinc-300">{message}</p>
        </div>
      </div>
    </div>
  );
}

export default async function PostPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams?.id;

  if (!id || id === "undefined") {
    return <ErrorState message="Identificador de post invalido." />;
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const currentUserId = userData.user?.id ?? null;

  const { data: myProfile } = currentUserId
    ? await supabase
        .from("profiles")
        .select("is_admin, is_banned")
        .eq("id", currentUserId)
        .maybeSingle()
    : { data: null };

  const isAdmin = Boolean(myProfile?.is_admin);
  const isBanned = Boolean(myProfile?.is_banned);

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return <ErrorState message={error.message} />;
  }

  if (!data) {
    return <ErrorState message="Post nao encontrado." />;
  }

  const post = data as PostItem;
  const { paragraphs, sourceUrl } = parseExcerpt(post.excerpt);

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

      <div className="relative mx-auto flex max-w-5xl flex-col gap-7 px-4 pb-24 pt-6 md:px-6 md:pt-8">
        <a
          href="/posts"
          className="text-xs uppercase tracking-[0.3em] text-zinc-400 transition hover:text-white"
        >
          Voltar para posts
        </a>

        <article className="glass overflow-hidden rounded-3xl border border-white/15">
          <div className="primary-stripe h-1.5" />

          <header className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.3em] text-zinc-400">
              <span className="rounded-full bg-blue-600 px-3 py-1 text-[10px] text-white">
                {post.tag}
              </span>
              <span>{formatDate(post.publish_date || post.created_at || "")}</span>
              {post.read_time ? <span>| {post.read_time}</span> : null}
              {post.is_hidden ? (
                <span className="rounded-full border border-red-400/40 bg-red-500/15 px-3 py-1 text-[10px] text-red-200">
                  Oculto na moderacao
                </span>
              ) : null}
            </div>

            <h1 className="mt-4 font-display text-4xl tracking-[0.1em] sm:text-5xl">
              {post.title}
            </h1>

            <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <p className="text-xs uppercase tracking-[0.3em] text-yellow-300">
                {post.author || "Equipe CRE"}
              </p>
              <PostLikeButton
                postId={post.id}
                initialCount={likeCount}
                initialLiked={likedByUser}
                userId={currentUserId}
              />
            </div>
          </header>

          {post.cover_url ? (
            <img
              src={post.cover_url}
              alt={post.title}
              className="h-72 w-full border-y border-white/10 object-cover sm:h-[420px]"
            />
          ) : null}

          <div className="p-6 sm:p-8">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-5 sm:p-6">
              {paragraphs.map((paragraph, index) => (
                <p
                  key={`paragraph-${index}`}
                  className="mb-4 text-base leading-relaxed text-zinc-200 last:mb-0"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {sourceUrl ? (
              <div className="mt-4 flex justify-end">
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-zinc-400 transition hover:border-white/40 hover:text-zinc-200"
                >
                  Fonte
                </a>
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="/posts"
                className="w-full rounded-full border border-white/20 px-5 py-3 text-center text-xs uppercase tracking-[0.25em] text-zinc-200 transition hover:border-white/50 hover:text-white sm:w-auto"
              >
                Ver todos os posts
              </a>
              <a
                href="/"
                className="w-full rounded-full border border-yellow-300/50 px-5 py-3 text-center text-xs uppercase tracking-[0.25em] text-yellow-200 transition hover:border-yellow-300 hover:text-yellow-100 sm:w-auto"
              >
                Voltar para home
              </a>
            </div>

            <PostComments
              postId={post.id}
              userId={currentUserId}
              isAdmin={isAdmin}
              isBanned={isBanned}
            />
          </div>
        </article>
      </div>
    </div>
  );
}
