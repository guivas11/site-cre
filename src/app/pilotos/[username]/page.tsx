import { createClient } from "@/lib/supabase/server";
import ProfileTabs from "../ProfileTabs";

export const dynamic = "force-dynamic";

type Victory = {
  id: string;
  title: string;
  track: string | null;
  position: string | null;
  category: string | null;
  date: string | null;
  notes: string | null;
  created_at: string | null;
};

type LapTimeRow = {
  track: string | null;
  time: string | null;
};

const normalizePosition = (value?: string | null) =>
  (value ?? "").toString().trim().toLowerCase();

const parseLapTimeMs = (value?: string | null) => {
  if (!value) return null;
  const match = value.match(/^(\d+):(\d{2})\.(\d{3})$/);
  if (!match) return null;
  return (
    Number(match[1]) * 60000 + Number(match[2]) * 1000 + Number(match[3])
  );
};

export default async function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const supabase = await createClient();
  const usernameParam = decodeURIComponent(params.username);

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, display_name, username, avatar_url, banner_url, bio, experience, favorite_track",
    )
    .eq("username", usernameParam)
    .maybeSingle();

  if (!profile) {
    const { data: fallbackUsers } = await supabase
      .from("profiles")
      .select("username, email")
      .order("created_at", { ascending: false })
      .limit(5);

    const safeFallbackUsers = fallbackUsers ?? [];

    return (
      <div className="min-h-screen racing-bg text-white">
        <div className="absolute inset-0 track-grid opacity-35" />
        <div className="absolute inset-0 scanline opacity-15" />

        <div className="relative mx-auto flex max-w-3xl flex-col gap-6 px-6 pb-24 pt-12">
          <h1 className="font-display text-3xl tracking-[0.12em]">
            Perfil não encontrado
          </h1>
          <p className="text-sm text-zinc-300">
            Username solicitado:{" "}
            <span className="text-yellow-300">@{usernameParam || ""}</span>
          </p>
          <div className="glass rounded-3xl p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
              Últimos usernames cadastrados
            </p>
            <ul className="mt-4 flex flex-col gap-2 text-sm text-zinc-200">
              {safeFallbackUsers.length === 0 ? (
                <li>Nenhum perfil encontrado.</li>
              ) : (
                safeFallbackUsers.map((user) => (
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
    .select("id, title, track, position, category, date, notes, created_at")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  const safeVictories = (victories ?? []) as Victory[];

  const winsCount = safeVictories.filter((victory) =>
    ["1º", "1", "p1", "1o", "1°"].includes(
      normalizePosition(victory.position),
    ),
  ).length;

  const podiumsCount = safeVictories.filter((victory) => {
    const pos = normalizePosition(victory.position);
    return ["1º", "1", "p1", "1o", "1°", "2º", "2", "p2", "2o", "2°", "3º", "3", "p3", "3o", "3°"].includes(pos);
  }).length;

  const trackCounts = safeVictories.reduce<Record<string, number>>((acc, victory) => {
    const track = victory.track?.trim();
    if (!track) return acc;
    acc[track] = (acc[track] ?? 0) + 1;
    return acc;
  }, {});

  const categoryCounts = safeVictories.reduce<Record<string, number>>((acc, victory) => {
    const category = victory.category?.trim();
    if (!category) return acc;
    acc[category] = (acc[category] ?? 0) + 1;
    return acc;
  }, {});

  const topTracks = Object.entries(trackCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const recentRaces = safeVictories.slice(0, 4);

  const { data: lapTimes } = await supabase
    .from("lap_times")
    .select("track, time")
    .eq("user_id", profile.id)
    .order("track", { ascending: true });

  const trackTimes = (lapTimes ?? []).map(
    (row: LapTimeRow) => [row.track, row.time] as const,
  );

  const timeEntries = trackTimes
    .map(([track, time]) => ({
      track: track ?? "",
      time: time ?? "",
      ms: parseLapTimeMs(time),
    }))
    .filter((entry) => entry.ms !== null) as Array<{
    track: string;
    time: string;
    ms: number;
  }>;

  const bestMs = timeEntries.length ? Math.min(...timeEntries.map((e) => e.ms)) : 0;
  const maxMs = timeEntries.length ? Math.max(...timeEntries.map((e) => e.ms)) : 0;

  return (
    <div className="min-h-screen racing-bg text-white">
      <div className="absolute inset-0 track-grid opacity-35" />
      <div className="absolute inset-0 scanline opacity-15" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-24 pt-12">
        <header className="glass rounded-3xl p-6 sm:p-8">
          <div
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/50"
            style={{
              backgroundImage: profile.banner_url ? `url(${profile.banner_url})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-black/10" />
            <div className="relative flex flex-col gap-6 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-2xl border border-white/15 bg-black/40">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.display_name || "Piloto"}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-yellow-300">
                    Perfil do piloto
                  </p>
                  <h1 className="font-display text-3xl tracking-[0.15em]">
                    {profile.display_name || "Piloto CRE"}
                  </h1>
                  <p className="text-sm uppercase tracking-[0.35em] text-zinc-300">
                    @{profile.username}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-center">
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Corridas</p>
                  <p className="text-lg font-semibold text-yellow-200">{safeVictories.length}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-center">
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Vitórias</p>
                  <p className="text-lg font-semibold text-yellow-200">{winsCount}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-center">
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Pódios</p>
                  <p className="text-lg font-semibold text-yellow-200">{podiumsCount}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <ProfileTabs
          overview={
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-yellow-300">
                  <span className="h-2 w-2 rounded-full bg-yellow-300" />
                  Bio
                </div>
                <p className="mt-3 text-sm leading-relaxed text-zinc-200">
                  {profile.bio || "Nenhuma bio cadastrada ainda."}
                </p>

                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                      Última corrida
                    </p>
                    <p className="mt-1 text-sm text-zinc-200">
                      {recentRaces[0]?.track || "Não informada"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                      Categoria favorita
                    </p>
                    <p className="mt-1 text-sm text-zinc-200">
                      {topCategories[0]?.[0] || "Não definida"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-yellow-300">
                  <span className="h-2 w-2 rounded-full bg-yellow-300" />
                  Experiência
                </div>
                <p className="mt-3 text-sm leading-relaxed text-zinc-200">
                  {profile.experience || "Experiência não informada."}
                </p>

                <div className="mt-6 grid gap-3">
                  <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                      Pistas favoritas
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {topTracks.length === 0 ? (
                        <span className="text-xs text-zinc-400">Nenhuma pista registrada.</span>
                      ) : (
                        topTracks.map(([track]) => (
                          <span
                            key={track}
                            className="rounded-full border border-white/10 bg-black/50 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-zinc-200"
                          >
                            {track}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                      Categorias mais corridas
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {topCategories.length === 0 ? (
                        <span className="text-xs text-zinc-400">Nenhuma categoria registrada.</span>
                      ) : (
                        topCategories.map(([category]) => (
                          <span
                            key={category}
                            className="rounded-full border border-white/10 bg-black/50 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-zinc-200"
                          >
                            {category}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
          races={
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl tracking-[0.18em]">
                  Últimas corridas
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
                      key={
                        race.id ??
                        `${race.track ?? "corrida"}-${race.date ?? "sem-data"}-${index}`
                      }
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm text-white">
                          {race.track || "Pista não informada"}
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
                      key={`${track}-${time}-${index}`}
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
                    Evolução de tempo
                  </h4>
                  <span className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                    Comparativo
                  </span>
                </div>
                <div className="mt-4 grid gap-3">
                  {timeEntries.length === 0 ? (
                    <p className="text-sm text-zinc-400">
                      Adicione tempos para ver o gráfico.
                    </p>
                  ) : (
                    timeEntries.map((entry, index) => {
                      const ratio = maxMs ? (maxMs - entry.ms) / maxMs : 0;
                      const width = maxMs ? 20 + ratio * 80 : 50;
                      const delta = entry.ms - bestMs;
                      const deltaLabel =
                        delta > 0 ? `+${(delta / 1000).toFixed(3)}s` : "melhor";
                      return (
                        <div
                          key={`${entry.track}-${entry.time}-${index}`}
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
              Vitórias e resultados
            </h2>
            <span className="text-xs uppercase tracking-[0.3em] text-zinc-400">
              {safeVictories.length} registros
            </span>
          </div>
          <div className="mt-6 grid gap-3">
            {safeVictories.length === 0 ? (
              <p className="text-sm text-zinc-400">
                Nenhuma vitória cadastrada ainda.
              </p>
            ) : (
              safeVictories.map((victory, index) => (
                <div
                  key={
                    victory.id ??
                    `${victory.title ?? "vitoria"}-${victory.created_at ?? "sem-data"}-${index}`
                  }
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
                    {victory.track || "Pista não informada"}{" "}
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