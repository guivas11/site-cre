import { createClient } from "@/lib/supabase/server";

const MAX_ITEMS = 200;

function parsePosition(value?: string | null) {
  if (!value) return null;
  const match = value.match(/\d+/);
  if (!match) return null;
  const num = Number.parseInt(match[0], 10);
  return Number.isNaN(num) ? null : num;
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

type Victory = {
  id: string;
  user_id: string;
  title: string;
  category: string | null;
  track: string | null;
  position: string | null;
  date: string | null;
  notes: string | null;
  created_at: string | null;
};

type Profile = {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
};

export default async function VitoriasPage() {
  const supabase = await createClient();

  const { data: victoriesData } = await supabase
    .from("victories")
    .select("*")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(MAX_ITEMS);

  const victories = (victoriesData ?? []) as Victory[];
  const userIds = Array.from(new Set(victories.map((item) => item.user_id)));

  const { data: profilesData } = await supabase
    .from("profiles")
    .select("id, display_name, username, avatar_url")
    .in("id", userIds);

  const profiles = (profilesData ?? []) as Profile[];
  const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));

  const summaryMap = new Map<
    string,
    { wins: number; podiums: number; total: number }
  >();

  victories.forEach((victory) => {
    const position = parsePosition(victory.position);
    const summary = summaryMap.get(victory.user_id) ?? {
      wins: 0,
      podiums: 0,
      total: 0,
    };
    summary.total += 1;
    if (position === 1) summary.wins += 1;
    if (position !== null && position <= 3) summary.podiums += 1;
    summaryMap.set(victory.user_id, summary);
  });

  const rankingByWins = [...summaryMap.entries()]
    .map(([userId, stats]) => ({ userId, ...stats }))
    .sort((a, b) => b.wins - a.wins || b.podiums - a.podiums || b.total - a.total)
    .slice(0, 8);

  const rankingByPodiums = [...summaryMap.entries()]
    .map(([userId, stats]) => ({ userId, ...stats }))
    .sort((a, b) => b.podiums - a.podiums || b.wins - a.wins || b.total - a.total)
    .slice(0, 8);

  const grouped = new Map<string, Victory[]>();
  victories.forEach((victory) => {
    const list = grouped.get(victory.user_id) ?? [];
    list.push(victory);
    grouped.set(victory.user_id, list);
  });

  const pilots = [...grouped.entries()].map(([userId, list]) => ({
    userId,
    list,
    summary: summaryMap.get(userId) ?? { wins: 0, podiums: 0, total: 0 },
  }));

  return (
    <div className="min-h-screen racing-bg text-white">
      <div className="absolute inset-0 track-grid opacity-35" />
      <div className="absolute inset-0 scanline opacity-15" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-24 pt-6 md:gap-10 md:px-6 md:pt-8">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-yellow-300">
              Central CRE
            </p>
            <h1 className="font-display text-4xl tracking-[0.12em] sm:text-5xl">
              Vitorias e resultados
            </h1>
            <p className="mt-3 max-w-xl text-sm text-zinc-300">
              Ranking dos pilotos, ultimos resultados e destaques por categoria.
            </p>
          </div>
          <a
            className="rounded-full border border-white/20 px-5 py-3 text-xs uppercase tracking-[0.25em] text-zinc-200 transition hover:border-white/50 hover:text-white"
            href="/"
          >
            Voltar para a home
          </a>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="glass rounded-2xl p-4 md:rounded-3xl md:p-6">
            <h2 className="text-sm uppercase tracking-[0.4em] text-yellow-300">
              Ranking por vitorias
            </h2>
            <div className="mt-5 grid gap-3">
              {rankingByWins.length === 0 ? (
                <p className="text-sm text-zinc-400">
                  Nenhuma vitoria registrada ainda.
                </p>
              ) : (
                rankingByWins.map((entry, index) => {
                  const profile = profileMap.get(entry.userId);
                  return (
                    <div
                      key={entry.userId}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-zinc-500">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="h-9 w-9 overflow-hidden rounded-full border border-white/10 bg-black/60">
                          {profile?.avatar_url ? (
                            <img
                              src={profile.avatar_url}
                              alt={profile.display_name || "Piloto"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-400">
                              {(profile?.display_name || "P").slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-white">
                            {profile?.display_name || "Piloto CRE"}
                          </p>
                          <p className="text-xs text-zinc-500">
                            @{profile?.username || "piloto"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-xs text-zinc-400">
                        <p className="text-sm text-white">{entry.wins} vitorias</p>
                        <p>{entry.podiums} podios</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="glass rounded-2xl p-4 md:rounded-3xl md:p-6">
            <h2 className="text-sm uppercase tracking-[0.4em] text-yellow-300">
              Ranking por podios
            </h2>
            <div className="mt-5 grid gap-3">
              {rankingByPodiums.length === 0 ? (
                <p className="text-sm text-zinc-400">
                  Nenhum podio registrado ainda.
                </p>
              ) : (
                rankingByPodiums.map((entry, index) => {
                  const profile = profileMap.get(entry.userId);
                  return (
                    <div
                      key={entry.userId}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-zinc-500">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="h-9 w-9 overflow-hidden rounded-full border border-white/10 bg-black/60">
                          {profile?.avatar_url ? (
                            <img
                              src={profile.avatar_url}
                              alt={profile.display_name || "Piloto"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-400">
                              {(profile?.display_name || "P").slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-white">
                            {profile?.display_name || "Piloto CRE"}
                          </p>
                          <p className="text-xs text-zinc-500">
                            @{profile?.username || "piloto"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-xs text-zinc-400">
                        <p className="text-sm text-white">{entry.podiums} podios</p>
                        <p>{entry.wins} vitorias</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        <section className="glass rounded-3xl overflow-hidden">
          <div className="primary-stripe h-2" />
          <div className="grid gap-6 p-6 sm:p-8">
            <h2 className="text-sm uppercase tracking-[0.4em] text-yellow-300">
              Ultimos resultados
            </h2>
            {victories.length === 0 ? (
              <p className="text-sm text-zinc-400">
                Nenhum resultado cadastrado ainda.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {victories.slice(0, 8).map((victory) => {
                  const profile = profileMap.get(victory.user_id);
                  return (
                    <div
                      key={victory.id}
                      className="rounded-2xl border border-white/10 bg-black/40 p-4"
                    >
                      <div className="flex items-center justify-between text-xs text-zinc-400">
                        <span>{formatDate(victory.date || victory.created_at || "")}</span>
                        <span>{victory.category || "Categoria"}</span>
                      </div>
                      <h3 className="mt-2 text-lg font-semibold text-white">
                        {victory.title}
                      </h3>
                      <p className="mt-1 text-sm text-zinc-300">
                        {victory.track || "Pista nao informada"}
                      </p>
                      <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
                        <span>
                          {profile?.display_name || "Piloto CRE"}
                        </span>
                        <span>{victory.position || "-"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          {pilots.map((pilot) => {
            const profile = profileMap.get(pilot.userId);
            return (
              <div
                key={pilot.userId}
                className="glass rounded-2xl p-4 md:rounded-3xl md:p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 overflow-hidden rounded-full border border-white/10 bg-black/60">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.display_name || "Piloto"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-400">
                        {(profile?.display_name || "P").slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-white">
                      {profile?.display_name || "Piloto CRE"}
                    </p>
                    <p className="text-xs text-zinc-500">
                      @{profile?.username || "piloto"}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-xs text-zinc-400">
                  <span className="rounded-full border border-white/10 bg-black/50 px-3 py-1">
                    {pilot.summary.wins} vitorias
                  </span>
                  <span className="rounded-full border border-white/10 bg-black/50 px-3 py-1">
                    {pilot.summary.podiums} podios
                  </span>
                  <span className="rounded-full border border-white/10 bg-black/50 px-3 py-1">
                    {pilot.summary.total} corridas
                  </span>
                </div>
                <div className="mt-4 grid gap-3">
                  {pilot.list.slice(0, 3).map((victory) => (
                    <div
                      key={victory.id}
                      className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3"
                    >
                      <div className="flex items-center justify-between text-xs text-zinc-500">
                        <span>{victory.track || "Pista"}</span>
                        <span>{victory.position || "-"}</span>
                      </div>
                      <p className="mt-1 text-sm text-white">
                        {victory.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}

