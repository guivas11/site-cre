import { createClient } from "@/lib/supabase/server";
import PilotsGrid from "./PilotsGrid";

export const dynamic = "force-dynamic";

type VictoryRow = {
  user_id: string;
  category: string | null;
  date: string | null;
  created_at: string | null;
};

export default async function PilotsPage() {
  const supabase = await createClient();
  const { data: pilots = [] } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, banner_url, experience, bio")
    .order("created_at", { ascending: false });
  const { data: victoriesData } = await supabase
    .from("victories")
    .select("user_id, category, date, created_at")
    .order("created_at", { ascending: false });
  const { data: userData } = await supabase.auth.getUser();
  const currentUserId = userData.user?.id ?? null;

  const victories = (victoriesData ?? []) as VictoryRow[];\r\n  const safePilots = (pilots ?? []) as PilotRow[];
  const pilotById = new Map(safePilots.map((pilot) => [pilot.id, pilot]));

  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);

  const recentCounts = new Map<string, number>();
  const totalCounts = new Map<string, number>();
  const categoryCounts = new Map<string, Map<string, number>>();

  victories.forEach((victory) => {
    const dateValue = victory.date || victory.created_at || "";
    const eventDate = dateValue ? new Date(dateValue) : null;
    const category = victory.category?.trim() || "Geral";

    totalCounts.set(
      victory.user_id,
      (totalCounts.get(victory.user_id) ?? 0) + 1,
    );

    if (eventDate && eventDate >= weekAgo) {
      recentCounts.set(
        victory.user_id,
        (recentCounts.get(victory.user_id) ?? 0) + 1,
      );
    }

    if (!categoryCounts.has(category)) {
      categoryCounts.set(category, new Map());
    }
    const categoryMap = categoryCounts.get(category)!;
    categoryMap.set(
      victory.user_id,
      (categoryMap.get(victory.user_id) ?? 0) + 1,
    );
  });

  const pickFeatured = () => {
    const source = recentCounts.size > 0 ? recentCounts : totalCounts;
    let bestId = "";
    let bestScore = 0;
    source.forEach((score, userId) => {
      if (score > bestScore) {
        bestScore = score;
        bestId = userId;
      }
    });
    return bestId ? { id: bestId, score: bestScore } : null;
  };

  const featured = pickFeatured();
  const featuredPilot = featured ? pilotById.get(featured.id) : null;

  const rankings = Array.from(categoryCounts.entries()).map(
    ([category, map]) => {
      const entries = Array.from(map.entries())
        .map(([userId, count]) => ({
          userId,
          count,
          pilot: pilotById.get(userId) ?? null,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      return { category, entries };
    },
  );
  rankings.sort((a, b) => b.entries.length - a.entries.length);

  return (
    <div className="min-h-screen racing-bg text-white">
      <div className="absolute inset-0 track-grid opacity-35" />
      <div className="absolute inset-0 scanline opacity-15" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-24 pt-12">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-yellow-300">
              Comunidade CRE
            </p>
            <h1 className="font-display text-4xl tracking-[0.12em]">
              Pilotos cadastrados
            </h1>
            <p className="mt-2 text-sm text-zinc-300">
              Explore perfis, vitorias e experiencias de cada piloto.
            </p>
          </div>
          <a
            className="rounded-full border border-white/20 px-5 py-3 text-xs uppercase tracking-[0.25em] text-zinc-200 transition hover:border-white/50 hover:text-white"
            href="/"
          >
            Voltar para a home
          </a>
        </header>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="glass rounded-3xl p-6">
            <p className="text-xs uppercase tracking-[0.35em] text-yellow-300">
              Piloto da semana
            </p>
            {featuredPilot ? (
              <div className="mt-5 flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-2xl border border-white/10 bg-black/60">
                  {featuredPilot.avatar_url ? (
                    <img
                      src={featuredPilot.avatar_url}
                      alt={featuredPilot.display_name || "Piloto"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
                      {featuredPilot.display_name?.slice(0, 2).toUpperCase() ||
                        "CRE"}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {featuredPilot.display_name || "Piloto CRE"}
                  </p>
                  <p className="text-xs uppercase tracking-[0.3em] text-yellow-300">
                    {featuredPilot.username
                      ? `@${featuredPilot.username}`
                      : "Sem username"}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.3em] text-zinc-400">
                    {featured?.score ?? 0} vitorias na semana
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-zinc-400">
                Nenhuma vitoria registrada nesta semana.
              </p>
            )}
          </div>

          <div className="glass rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.35em] text-yellow-300">
                Ranking por categoria
              </p>
              <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                Top 5
              </span>
            </div>
            <div className="mt-5 grid gap-4">
              {rankings.length === 0 ? (
                <p className="text-sm text-zinc-400">
                  Sem vitorias registradas.
                </p>
              ) : (
                rankings.slice(0, 3).map((ranking) => (
                  <div
                    key={ranking.category}
                    className="rounded-2xl border border-white/10 bg-black/40 p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                      {ranking.category}
                    </p>
                    <div className="mt-3 grid gap-2">
                      {ranking.entries.map((entry, index) => (
                        <div
                          key={`${ranking.category}-${entry.userId}`}
                          className="flex items-center justify-between text-sm text-zinc-200"
                        >
                          <span className="uppercase tracking-[0.2em] text-zinc-400">
                            #{index + 1}
                          </span>
                          <span className="flex-1 px-3">
                            {entry.pilot?.display_name || "Piloto CRE"}
                          </span>
                          <span className="text-xs text-yellow-300">
                            {entry.count} vitorias
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <PilotsGrid pilots={pilots} currentUserId={currentUserId} />
      </div>
    </div>
  );
}