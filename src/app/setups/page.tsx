import { createClient } from "@/lib/supabase/server";
import { f1Tracks } from "@/lib/f1Tracks";
import { createSetup, deleteSetup } from "./actions";

type PageProps = {
  searchParams?: {
    q?: string;
    track?: string;
    error?: string;
    success?: string;
  };
};

export default async function SetupsPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id ?? null;

  const selectedTrack = String(searchParams?.track ?? "").trim();
  const queryText = String(searchParams?.q ?? "").trim().toLowerCase();

  const { data: setupsData } = await supabase
    .from("track_setups")
    .select("id,user_id,title,track,category,car_name,setup_version,lap_time,setup_notes,created_at")
    .order("created_at", { ascending: false })
    .limit(300);

  const setups = setupsData ?? [];

  const authorIds = Array.from(new Set(setups.map((s) => s.user_id)));
  const { data: authorsData } = authorIds.length
    ? await supabase
        .from("profiles")
        .select("id,display_name,username")
        .in("id", authorIds)
    : { data: [] as Array<{ id: string; display_name: string | null; username: string | null }> };

  const authorMap = new Map((authorsData ?? []).map((a) => [a.id, a]));

  const filtered = setups.filter((setup) => {
    if (selectedTrack && setup.track !== selectedTrack) return false;
    if (!queryText) return true;
    const author = authorMap.get(setup.user_id);
    const blob = [
      setup.title,
      setup.track,
      setup.category ?? "",
      setup.car_name ?? "",
      setup.setup_version ?? "",
      setup.setup_notes,
      author?.display_name ?? "",
      author?.username ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return blob.includes(queryText);
  });

  const messageError = typeof searchParams?.error === "string" ? searchParams.error : "";
  const messageSuccess = typeof searchParams?.success === "string" ? searchParams.success : "";

  return (
    <div className="min-h-screen racing-bg text-white">
      <div className="absolute inset-0 track-grid opacity-35" />
      <div className="absolute inset-0 scanline opacity-15" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-7 px-4 pb-24 pt-6 md:gap-8 md:px-6 md:pt-8">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-yellow-300">Setup Center</p>
            <h1 className="font-display text-4xl tracking-[0.12em] sm:text-5xl">Setups por pista</h1>
          </div>
          <a
            href="/"
            className="rounded-full border border-white/20 px-5 py-3 text-xs uppercase tracking-[0.25em] text-zinc-200 transition hover:border-white/50 hover:text-white"
          >
            Voltar para home
          </a>
        </header>

        {messageError ? (
          <p className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{messageError}</p>
        ) : null}
        {messageSuccess ? (
          <p className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{messageSuccess}</p>
        ) : null}

        <section className="glass rounded-2xl p-4 md:rounded-3xl md:p-6">
          <form className="grid gap-3 md:grid-cols-[1fr_1fr_auto]" action="/setups" method="get">
            <input
              className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
              type="search"
              name="q"
              placeholder="Buscar por pista, titulo, autor"
              defaultValue={queryText}
            />
            <select
              className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
              name="track"
              defaultValue={selectedTrack}
            >
              <option value="">Todas as pistas</option>
              {f1Tracks.map((track) => (
                <option key={track} value={track}>
                  {track}
                </option>
              ))}
            </select>
            <button
              className="rounded-2xl border border-yellow-300/50 bg-yellow-300/10 px-5 py-3 text-xs uppercase tracking-[0.3em] text-yellow-100 transition hover:bg-yellow-300/20"
              type="submit"
            >
              Filtrar
            </button>
          </form>
        </section>

        {userId ? (
          <section className="glass rounded-2xl p-4 md:rounded-3xl md:p-6">
            <p className="text-xs uppercase tracking-[0.35em] text-yellow-300">Publicar setup</p>
            <form action={createSetup} className="mt-4 grid gap-3 md:grid-cols-2">
              <input
                className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                name="title"
                placeholder="Titulo do setup"
                required
              />
              <select
                className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                name="track"
                required
              >
                <option value="">Selecione a pista</option>
                {f1Tracks.map((track) => (
                  <option key={track} value={track}>
                    {track}
                  </option>
                ))}
              </select>
              <input
                className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                name="category"
                placeholder="Categoria (F1, F2, GT3...)"
              />
              <input
                className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                name="car_name"
                placeholder="Carro (ex: Ferrari SF-26)"
              />
              <input
                className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                name="setup_version"
                placeholder="Versao (ex: v1.2 seco)"
              />
              <input
                className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                name="lap_time"
                placeholder="Tempo de volta (ex: 1:32.550)"
              />
              <textarea
                className="dashboard-textarea md:col-span-2 min-h-28 w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                name="setup_notes"
                placeholder="Descreva freio, asa, diferencial, pressao de pneus, etc"
                required
              />
              <div className="md:col-span-2">
                <button
                  className="rounded-2xl border border-blue-400/60 bg-blue-500/20 px-6 py-3 text-xs uppercase tracking-[0.3em] text-blue-100 transition hover:bg-blue-500/30"
                  type="submit"
                >
                  Publicar setup
                </button>
              </div>
            </form>
          </section>
        ) : (
          <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-400">
            Entre na sua conta para enviar setups.
          </p>
        )}

        <section className="grid gap-4">
          {filtered.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-400">
              Nenhum setup encontrado.
            </p>
          ) : (
            filtered.map((setup) => {
              const author = authorMap.get(setup.user_id);
              const name = author?.display_name || (author?.username ? `@${author.username}` : "Piloto CRE");
              return (
                <article key={setup.id} className="glass rounded-3xl p-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.3em] text-zinc-400">
                    <span className="rounded-full border border-white/15 bg-black/40 px-3 py-1">{setup.track}</span>
                    {setup.category ? (
                      <span className="rounded-full border border-white/15 bg-black/40 px-3 py-1">{setup.category}</span>
                    ) : null}
                    {setup.car_name ? (
                      <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-cyan-100">{setup.car_name}</span>
                    ) : null}
                    {setup.setup_version ? (
                      <span className="rounded-full border border-blue-300/30 bg-blue-300/10 px-3 py-1 text-blue-100">{setup.setup_version}</span>
                    ) : null}
                    {setup.lap_time ? (
                      <span className="rounded-full border border-yellow-300/30 bg-yellow-300/10 px-3 py-1 text-yellow-200">{setup.lap_time}</span>
                    ) : null}
                  </div>
                  <h2 className="mt-3 text-xl font-semibold text-white">{setup.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-300 whitespace-pre-line">{setup.setup_notes}</p>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-yellow-300">{name}</p>
                    {userId === setup.user_id ? (
                      <form action={deleteSetup}>
                        <input type="hidden" name="setup_id" value={setup.id} />
                        <button
                          type="submit"
                          className="rounded-full border border-red-400/50 px-3 py-1.5 text-[10px] uppercase tracking-[0.3em] text-red-200 transition hover:border-red-300"
                        >
                          Remover
                        </button>
                      </form>
                    ) : null}
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}






