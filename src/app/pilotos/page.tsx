import { createClient } from "@/lib/supabase/server";
import PilotsGrid from "./PilotsGrid";

export const dynamic = "force-dynamic";

type PilotRow = {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  experience: string | null;
  bio: string | null;
};

type VictoryRow = {
  id: string;
  user_id: string;
  position: string | null;
  category: string | null;
  track: string | null;
  created_at: string | null;
};

export default async function PilotsPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const currentUserId = userData.user?.id ?? null;

  const { data: pilots } = await supabase
    .from("profiles")
    .select("id, display_name, username, avatar_url, banner_url, experience, bio")
    .order("created_at", { ascending: false });

  const { data: victoriesData } = await supabase
    .from("victories")
    .select("id, user_id, position, category, track, created_at")
    .order("created_at", { ascending: false });

  const victories = (victoriesData ?? []) as VictoryRow[];
  const safePilots = (pilots ?? []) as PilotRow[];
  const pilotById = new Map(safePilots.map((pilot) => [pilot.id, pilot]));

  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);

  const recentVictories = victories.filter((victory) => {
    if (!victory.created_at) return false;
    return new Date(victory.created_at) >= weekAgo;
  });

  const weeklyWins = recentVictories.filter((victory) => {
    const pos = victory.position?.toLowerCase() ?? "";
    return ["1", "1o", "p1", "p01"].includes(pos);
  });

  const spotlightId =
    weeklyWins.length > 0
      ? weeklyWins[0].user_id
      : recentVictories[0]?.user_id ?? safePilots[0]?.id ?? null;

  const spotlight = spotlightId ? pilotById.get(spotlightId) : null;

  return (
    <div className="min-h-screen racing-bg text-white">
      <div className="absolute inset-0 track-grid opacity-35" />
      <div className="absolute inset-0 scanline opacity-15" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-24 pt-6 md:gap-10 md:px-6 md:pt-12">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-yellow-300">Comunidade CRE</p>
            <h1 className="font-display text-3xl tracking-[0.2em]">Pilotos cadastrados</h1>
            <p className="mt-2 text-sm text-zinc-300">
              Explore perfis, vitorias e experiencias de cada piloto.
            </p>
          </div>
          <a
            href="/"
            className="w-full rounded-full border border-white/20 px-5 py-3 text-center text-xs uppercase tracking-[0.25em] text-zinc-200 transition hover:border-white/50 hover:text-white sm:w-auto"
          >
            Voltar para a home
          </a>
        </header>

        <section className="glass rounded-2xl p-4 sm:p-6 md:rounded-3xl md:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Piloto em destaque</p>
              <h2 className="mt-3 font-display text-2xl tracking-[0.18em]">
                {spotlight?.display_name || spotlight?.username || "Piloto CRE"}
              </h2>
              <p className="mt-2 text-sm text-zinc-300">
                {spotlight?.experience || "Sem experiencia cadastrada ainda."}
              </p>
            </div>
            {spotlight ? (
              <div className="flex items-center gap-4 rounded-3xl border border-white/10 bg-black/50 px-5 py-4">
                {spotlight.avatar_url ? (
                  <img
                    src={spotlight.avatar_url}
                    alt={spotlight.display_name || "Piloto"}
                    className="h-14 w-14 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-lg">
                    {spotlight.display_name?.slice(0, 1) || "C"}
                  </div>
                )}
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-yellow-300">
                    {spotlight.username ? `@${spotlight.username}` : "Sem username"}
                  </p>
                  <p className="text-sm text-zinc-200">{spotlight.display_name || "Piloto CRE"}</p>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <PilotsGrid pilots={safePilots} currentUserId={currentUserId} />
      </div>
    </div>
  );
}
