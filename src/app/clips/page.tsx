import { createClient } from "@/lib/supabase/server";
import ClipUpload from "./ClipUpload";
import ClipFormModal from "./ClipFormModal";
import { createClip, deleteClip } from "./actions";

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

function normalizeYoutubeUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return "";
  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace("www.", "");
    if (host === "youtu.be") {
      return `https://www.youtube.com/embed/${parsed.pathname.replace("/", "")}`;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = parsed.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      if (parsed.pathname.startsWith("/embed/")) return trimmed;
    }
  } catch {
    return "";
  }
  return "";
}

type PageProps = {
  searchParams?: { error?: string; success?: string };
};

export default async function ClipsPage({ searchParams }: PageProps) {
  const supabase = await createClient();

  const { data: clipsData } = await supabase
    .from("race_clips")
    .select("id,title,description,clip_url,youtube_url,category,track,lap_time,created_at,user_id")
    .order("created_at", { ascending: false });

  const clips = clipsData ?? [];

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id ?? null;

  const { data: profiles } = userId
    ? await supabase
        .from("profiles")
        .select("id,display_name,username,avatar_url")
        .in(
          "id",
          clips.map((clip) => clip.user_id),
        )
    : { data: [] };

  const profileMap = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile]),
  );

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
              Clips CRE
            </p>
            <h1 className="font-display text-4xl tracking-[0.12em] sm:text-5xl">
              Momentos em pista
            </h1>
            <p className="mt-3 max-w-xl text-sm text-zinc-300">
              Publique seus melhores momentos em video ou compartilhe clips do
              YouTube.
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

        {userId ? (
          <section className="glass rounded-3xl p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-yellow-300">
                  Envio de clips
                </p>
                <p className="mt-2 text-sm text-zinc-300">
                  Abra o popup para publicar seu video com descrição completa.
                </p>
              </div>
              <ClipFormModal userId={userId} action={createClip} />
            </div>
          </section>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-400">
            Faça login para publicar clips.
          </div>
        )}

        <section className="grid gap-6 lg:grid-cols-2">
          {clips.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-400">
              Nenhum clip publicado ainda.
            </div>
          ) : (
            clips.map((clip) => {
              const profile = profileMap.get(clip.user_id);
              const youtubeEmbed = clip.youtube_url
                ? normalizeYoutubeUrl(clip.youtube_url)
                : "";
              return (
                <article
                  key={clip.id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-zinc-400">
                    <span className="rounded-full bg-yellow-300/15 px-3 py-1 text-[10px] text-yellow-200">
                      Clip CRE
                    </span>
                    <span>{formatDate(clip.created_at)}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-white">
                    {clip.title}
                  </h3>
                  {clip.description ? (
                    <p className="mt-2 text-sm text-zinc-300 whitespace-pre-line">
                      {clip.description}
                    </p>
                  ) : null}
                  {clip.category || clip.track || clip.lap_time ? (
                    <div className="mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.3em] text-zinc-400">
                      {clip.category ? (
                        <span className="rounded-full border border-white/10 bg-black/60 px-3 py-1">
                          {clip.category}
                        </span>
                      ) : null}
                      {clip.track ? (
                        <span className="rounded-full border border-white/10 bg-black/60 px-3 py-1">
                          {clip.track}
                        </span>
                      ) : null}
                      {clip.lap_time ? (
                        <span className="rounded-full border border-white/10 bg-black/60 px-3 py-1">
                          {clip.lap_time}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                  <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/60">
                    {youtubeEmbed ? (
                      <iframe
                        className="h-60 w-full"
                        src={youtubeEmbed}
                        title={clip.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : clip.clip_url ? (
                      <video
                        className="h-60 w-full object-cover"
                        src={clip.clip_url}
                        controls
                      />
                    ) : (
                      <div className="flex h-60 items-center justify-center text-xs uppercase tracking-[0.3em] text-zinc-500">
                        Sem video
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-9 w-9 overflow-hidden rounded-full border border-white/20 bg-black/60">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt="Avatar"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-300">
                          {(profile?.display_name || "CRE").slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-white">
                        {profile?.display_name || "Piloto CRE"}
                      </p>
                      {profile?.username ? (
                        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                          @{profile.username}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  {userId === clip.user_id ? (
                    <form className="mt-4 flex justify-end" action={deleteClip}>
                      <input type="hidden" name="clip_id" value={clip.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-red-400/50 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-red-200 transition hover:border-red-400 hover:text-red-100"
                      >
                        Apagar clip
                      </button>
                    </form>
                  ) : null}
                </article>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}











