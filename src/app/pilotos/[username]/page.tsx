import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileTabs from "../ProfileTabs";

type ProfilePageProps = {
  params: Promise<{ username: string }>;
};

export const dynamic = "force-dynamic";

function parseLapTimeMs(value?: string | null) {
  if (!value) return null;
  const cleaned = value.replace(",", ".").trim();
  if (!cleaned) return null;
  const parts = cleaned.split(":");
  let minutes = 0;
  let seconds = 0;
  if (parts.length === 2) {
    minutes = Number.parseInt(parts[0], 10);
    seconds = Number.parseFloat(parts[1]);
  } else {
    seconds = Number.parseFloat(cleaned);
  }
  if (Number.isNaN(minutes) || Number.isNaN(seconds)) return null;
  return (minutes * 60 + seconds) * 1000;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const resolvedParams = await params;
  const usernameParam = resolvedParams.username?.trim();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .ilike("username", usernameParam)
    .maybeSingle();

  if (!profile) {
    const { data: fallbackUsers = [] } = await supabase
      .from("profiles")
      .select("username, email")
      .order("created_at", { ascending: false })
      .limit(5);
    return (
      <div className="min-h-screen racing-bg text-white">
        <div className="absolute inset-0 track-grid opacity-35" />
        <div className="absolute inset-0 scanline opacity-15" />

        <div className="relative mx-auto flex max-w-3xl flex-col gap-6 px-6 pb-24 pt-12">
          <h1 className="font-display text-3xl tracking-[0.12em]">
            Perfil não encontrado
          </h1>
          <p className="text-sm text-zinc-300">
            Username solicitado: <span className="text-yellow-300">@{usernameParam || ""}</span>
          </p>
          <div className="glass rounded-3xl p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
              Últimos usernames cadastrados
            </p>
            <ul className="mt-4 flex flex-col gap-2 text-sm text-zinc-200">
              {fallbackUsers.length === 0 ? (
                <li>Nenhum perfil encontrado.</li>
              ) : (
                fallbackUsers.map((user) => (
                  <li key={`${user.username}-${user.email}`}>
                    @{user.username ?? "(sem username)"} - {user.email ?? ""}
                  </li>
                ))
              )}
            </ul>
            <a
              href="/pilotos"
              className="mt-6 inline-flex rounded-full border border-white/20 px-5 py-3 text-xs uppercase tracking-[0.25em] text-zinc-200 transition hover:border-white/50 hover:text-white"
            >
              Voltar para pilotos
            </a>
          </div>
        </div>
      </div>
    );
  }

  const { data: victories } = await supabase
    .from("victories")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });
  const safeVictories = victories ?? [];
  const normalizePosition = (value?: string | null) =>
    (value ?? "").toString().trim().toLowerCase();
  const winsCount = safeVictories.filter((victory) =>
    ["1", "p1", "1o"].includes(
      normalizePosition(victory.position),
    ),
  ).length;
  const podiumCount = safeVictories.filter((victory) =>
    ["1", "2", "3", "1", "2", "3", "p1", "p2", "p3", "1o", "2o", "3o", "1", "2", "3"].includes(
      normalizePosition(victory.position),
    ),
  ).length;
  const tracksMap = safeVictories.reduce<Record<string, number>>(
    (acc, victory) => {
      const track = victory.track?.trim();
      if (!track) return acc;
      acc[track] = (acc[track] ?? 0) + 1;
      return acc;
    },
    {},
  );
  const topTracks = Object.entries(tracksMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const categoriesMap = safeVictories.reduce<Record<string, number>>(
    (acc, victory) => {
      const category = victory.category?.trim();
      if (!category) return acc;
      acc[category] = (acc[category] ?? 0) + 1;
      return acc;
    },
    {},
  );
  const topCategory = Object.entries(categoriesMap).sort(
    (a, b) => b[1] - a[1],
  )[0]?.[0];
  const lastRace = safeVictories[0];
  const recentRaces = safeVictories.slice(0, 5);

  const { data: lapTimes } = await supabase
    .from("lap_times")
    .select("*")
    .eq("user_id", profile.id)
    .order("track", { ascending: true });
  const trackTimes = (lapTimes ?? []).map(
    (row) => [row.track, row.time] as const,
  );

  const timeEntries = trackTimes
    .map(([track, time]) => ({
      track,
      time,
      ms: parseLapTimeMs(time),
    }))
    .filter((entry) => entry.ms !== null) as Array<{
      track: string;
      time: string;
      ms: number;
    }>;

  const bestMs = timeEntries.length ? Math.min(...timeEntries.map((e) => e.ms)) : 0;
  const maxMs = timeEntries.length ? Math.max(...timeEntries.map((e) => e.ms)) : 0;

  const { data: userData } = await supabase.auth.getUser();
  const isOwner = userData.user?.id === profile.id;

  return (
    <div className="min-h-screen racing-bg text-white">
      <div className="absolute inset-0 track-grid opacity-35" />
      <div className="absolute inset-0 scanline opacity-15" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-24 pt-12">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-yellow-300">
              Perfil do piloto
            </p>
            <h1 className="font-display text-4xl tracking-[0.12em]">
              {profile.display_name || "Piloto CRE"}
            </h1>
            {profile.username ? (
              <p className="mt-2 text-sm text-yellow-300">
                @{profile.username}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            {isOwner ? (
              <a
                className="rounded-full border border-yellow-300/40 px-5 py-3 text-xs uppercase tracking-[0.25em] text-yellow-200 transition hover:border-yellow-300 hover:text-yellow-100"
                href="/dashboard"
              >
                Editar perfil
              </a>
            ) : null}
            <a
              className="rounded-full border border-white/20 px-5 py-3 text-xs uppercase tracking-[0.25em] text-zinc-200 transition hover:border-white/50 hover:text-white"
              href="/"
            >
              Voltar para a home
            </a>
          </div>
        </header>

        <section className="glass overflow-hidden rounded-3xl">
          <div
            className="relative h-48 w-full sm:h-64"
            style={
              profile.banner_url
                ? {
                    backgroundImage: `url(${profile.banner_url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0">
              <div className="mx-4 mb-4 flex items-end justify-between gap-4 rounded-2xl border border-white/10 bg-black/60 p-4 backdrop-blur sm:mx-6 sm:mb-6 sm:p-5">
              <div className="flex items-center gap-4">
                <div className="h-18 w-18 overflow-hidden rounded-2xl border border-white/10 bg-black/70 sm:h-20 sm:w-20">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-zinc-400">
                      {profile.display_name?.slice(0, 2).toUpperCase() || "CRE"}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-yellow-300">
                    Piloto CRE
                  </p>
                  <p className="text-sm text-zinc-200">
                    {profile.experience || "Experincia no informada"}
                  </p>
                  {topCategory ? (
                    <p className="mt-1 text-xs uppercase tracking-[0.3em] text-zinc-300">
                      Categoria principal: {topCategory}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="hidden rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.3em] text-zinc-200 sm:block">
                {safeVictories.length} corridas registradas
              </div>
            </div>
            </div>
          </div>

          <div className="grid gap-6 p-6 sm:grid-cols-[1.1fr_0.9fr] sm:p-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                Bio
              </p>
              <p className="mt-2 text-sm text-zinc-300">
                {profile.bio || "Sem bio cadastrada."}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                    ltima corrida
                  </p>
                  <p className="mt-1 text-sm text-zinc-200">
                    {lastRace?.track || "No informada"}
                    {lastRace?.date ? `  ${lastRace.date}` : ""}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xl font-semibold text-yellow-300">
                  {safeVictories.length}
                </p>
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                  Corridas
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xl font-semibold text-yellow-300">
                  {winsCount}
                </p>
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                  Vitrias
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xl font-semibold text-yellow-300">
                  {podiumCount}
                </p>
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                  Pdios
                </p>
              </div>
            </div>
          </div>
        </section>

        <ProfileTabs
          overview={
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <h3 className="font-display text-2xl tracking-[0.18em]">
                  Pista favorita
                </h3>
                <p className="mt-2 text-sm text-zinc-300">
                  {profile.favorite_track || "Ainda no definida"}
                </p>
                <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/50">
                  {profile.favorite_track_image ? (
                    <img
                      src={profile.favorite_track_image}
                      alt="Pista favorita"
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-40 items-center justify-center text-xs uppercase tracking-[0.3em] text-zinc-500">
                      Sem imagem
                    </div>
                  )}
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <h3 className="font-display text-2xl tracking-[0.18em]">
                  Resumo da temporada
                </h3>
                <div className="mt-6 grid gap-4">
                  <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                      Categoria favorita
                    </p>
                    <p className="mt-1 text-sm text-zinc-200">
                      {topCategory || "No definida"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                      ltimo resultado
                    </p>
                    <p className="mt-1 text-sm text-zinc-200">
                      {lastRace?.title || "Sem resultados"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                      Pdios totais
                    </p>
                    <p className="mt-1 text-sm text-zinc-200">
                      {podiumCount} registros
                    </p>
                  </div>
                </div>
              </div>
            </div>
          }
          races={
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl tracking-[0.18em]">
                    ltimas corridas
                  </h3>
                  <span className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                    {recentRaces.length} registros
                  </span>
                </div>
                <div className="mt-6 grid gap-3">
                  {recentRaces.length === 0 ? (
                    <p className="text-sm text-zinc-400">
                      Nenhuma corrida cadastrada ainda.
                    </p>
                  ) : (
                    recentRaces.map((race, index) => (
                      <div
                        key={race.id ?? [race.track ?? "corrida", race.date ?? "sem-data", index].join("-")}
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-4 py-3"
                      >
                        <div>
                          <p className="text-sm text-white">
                            {race.track || "Pista no informada"}
                          </p>
                          <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                            {race.category || "Categoria livre"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-yellow-300">
                            {race.position || "-"}
                          </p>
                          <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                            {race.date || "Sem data"}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl tracking-[0.18em]">
                    Pistas mais corridas
                  </h3>
                  <span className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                    Top 3
                  </span>
                </div>
                <div className="mt-6 grid gap-3">
                  {topTracks.length === 0 ? (
                    <p className="text-sm text-zinc-400">
                      Nenhuma pista registrada ainda.
                    </p>
                  ) : (
                    topTracks.map(([track, count], index) => (
                      <div
                        key={[track, time, index].join("-")}
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/50 text-xs text-zinc-300">
                            {index + 1}
                          </span>
                          <div>
                            <p className="text-sm text-white">{track}</p>
                            <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                              {count} corridas
                            </p>
                          </div>
                        </div>
                        <span className="text-xs uppercase tracking-[0.3em] text-yellow-300">
                          Ativa
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          }
          times={
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl tracking-[0.18em]">
                  Tempos por pista
                </h3>
                <span className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                  Melhores tempos
                </span>
              </div>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {trackTimes.length === 0 ? (
                  <p className="text-sm text-zinc-400">
                    Nenhum tempo cadastrado ainda.
                  </p>
                ) : (
                  trackTimes.map(([track, time], index) => (
                    <div
                      key={[track, time, index].join("-")}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-4 py-3"
                    >
                      <p className="text-sm text-white">{track}</p>
                      <span className="text-sm text-yellow-300">{time}</span>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-8 rounded-2xl border border-white/10 bg-black/40 p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs uppercase tracking-[0.3em] text-zinc-300">
                    Evolucao de tempo
                  </h4>
                  <span className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                    Comparativo
                  </span>
                </div>
                <div className="mt-4 grid gap-3">
                  {timeEntries.length === 0 ? (
                    <p className="text-sm text-zinc-400">
                      Adicione tempos para ver o grafico.
                    </p>
                  ) : (
                    timeEntries.map((entry, index) => {
                      const ratio = maxMs ? (maxMs - entry.ms) / maxMs : 0;
                      const width = maxMs ? 20 + ratio * 80 : 50;
                      const delta = entry.ms - bestMs;
                      const deltaLabel = delta > 0 ? `+${(delta / 1000).toFixed(3)}s` : "melhor";
                      return (
                        <div
                          key={[entry.track, entry.time, index].join("-")}
                          className="grid items-center gap-3 md:grid-cols-[140px_1fr_80px_70px]"
                        >
                          <span className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                            {entry.track}
                          </span>
                          <div className="h-2 rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-yellow-300/80 via-yellow-200/80 to-emerald-400/80"
                              style={{ width: `${width}%` }}
                            />
                          </div>
                          <span className="text-xs text-yellow-200">{entry.time}</span>
                          <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                            {deltaLabel}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          }
        />

        <section className="glass rounded-3xl p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl tracking-[0.18em]">
              Vitrias e resultados
            </h2>
            <span className="text-xs uppercase tracking-[0.3em] text-zinc-400">
              {safeVictories.length} registros
            </span>
          </div>
          <div className="mt-6 grid gap-3">
            {safeVictories.length === 0 ? (
              <p className="text-sm text-zinc-400">
                Nenhuma vitria cadastrada ainda.
              </p>
            ) : (
              safeVictories.map((victory, index) => (
                <div
                  key={victory.id ?? [victory.title ?? "vitoria", victory.created_at ?? "sem-data", index].join("-")}
                  className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm uppercase tracking-[0.25em] text-yellow-300/80">
                      {victory.title}
                    </p>
                    {victory.date ? (
                      <span className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                        {victory.date}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-zinc-200">
                    {victory.track || "Pista no informada"}{" "}
                    {victory.position ? ` ${victory.position}` : ""}
                    {victory.category ? `  ${victory.category}` : ""}
                  </p>
                  {victory.notes ? (
                    <p className="text-xs text-zinc-400">{victory.notes}</p>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
