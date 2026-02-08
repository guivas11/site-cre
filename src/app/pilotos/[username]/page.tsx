import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type ProfilePageProps = {
  params: { username: string };
};

export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }: ProfilePageProps) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", params.username)
    .maybeSingle();

  if (!profile) {
    redirect("/dashboard");
  }

  const { data: victories = [] } = await supabase
    .from("victories")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

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
                className="rounded-full border border-white/20 px-5 py-3 text-xs uppercase tracking-[0.25em] text-zinc-200 transition hover:border-white/50 hover:text-white"
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

        <section className="glass rounded-3xl overflow-hidden">
          <div
            className="h-36 w-full border-b border-white/10"
            style={
              profile.banner_url
                ? {
                    backgroundImage: `url(${profile.banner_url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          />
          <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-2xl border border-white/10 bg-black/60">
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
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                  Experiência
                </p>
                <p className="text-base text-zinc-200">
                  {profile.experience || "Ainda não informado"}
                </p>
              </div>
            </div>
            <div className="text-sm text-zinc-300">
              {profile.bio || "Sem bio cadastrada."}
            </div>
          </div>
        </section>

        <section className="glass rounded-3xl p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl tracking-[0.18em]">
              Vitórias e resultados
            </h2>
            <span className="text-xs uppercase tracking-[0.3em] text-zinc-400">
              {victories.length} registros
            </span>
          </div>
          <div className="mt-6 grid gap-3">
            {victories.length === 0 ? (
              <p className="text-sm text-zinc-400">
                Nenhuma vitória cadastrada ainda.
              </p>
            ) : (
              victories.map((victory) => (
                <div
                  key={victory.id}
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
                    {victory.position ? `· ${victory.position}` : ""}
                    {victory.category ? ` · ${victory.category}` : ""}
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
