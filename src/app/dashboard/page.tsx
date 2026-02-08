import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { addVictory, deleteVictory, saveProfile, signOut } from "./actions";

export const dynamic = "force-dynamic";

type DashboardPageProps = {
  searchParams: Promise<{ error?: string; success?: string }>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }

  const metadata = data.user.user_metadata ?? {};
  const fallbackName =
    metadata.full_name ||
    metadata.name ||
    metadata.preferred_username ||
    data.user.email?.split("@")[0];
  const fallbackAvatar = metadata.avatar_url || metadata.picture;

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .maybeSingle();

  let profile = profileData;

  if (!profile) {
    const { data: created } = await supabase
      .from("profiles")
      .insert({
        id: data.user.id,
        email: data.user.email,
        display_name: fallbackName,
        avatar_url: fallbackAvatar,
      })
      .select()
      .single();
    profile = created;
  }

  const { data: victories } = await supabase
    .from("victories")
    .select("*")
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false });
  const safeVictories = victories ?? [];

  return (
    <div className="min-h-screen racing-bg text-white">
      <div className="absolute inset-0 track-grid opacity-35" />
      <div className="absolute inset-0 scanline opacity-15" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-24 pt-12">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-yellow-300">
              Área do piloto
            </p>
            <h1 className="font-display text-4xl tracking-[0.12em]">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-zinc-300">{data.user.email}</p>
          </div>
          <form action={signOut}>
            <button className="rounded-full border border-red-500/60 px-5 py-3 text-xs uppercase tracking-[0.25em] text-red-200 transition hover:border-red-400 hover:text-red-100">
              Sair
            </button>
          </form>
        </header>

        {params.error ? (
          <p className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {params.error}
          </p>
        ) : null}
        {params.success ? (
          <p className="rounded-2xl border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-200">
            {params.success}
          </p>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="glass rounded-3xl p-6">
            <div
              className="rounded-2xl border border-white/10 bg-black/50 p-4"
              style={
                profile?.banner_url
                  ? {
                      backgroundImage: `url(${profile.banner_url})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : undefined
              }
            >
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-2xl border border-white/10 bg-black/60">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-zinc-400">
                      {profile?.display_name?.slice(0, 2).toUpperCase() ||
                        "CRE"}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                    Perfil público
                  </p>
                  <h2 className="font-display text-2xl tracking-[0.18em]">
                    {profile?.display_name || "Piloto CRE"}
                  </h2>
                  {profile?.username ? (
                    <p className="text-sm text-yellow-300">@{profile.username}</p>
                  ) : null}
                </div>
              </div>
            </div>

            <form className="mt-6 grid gap-4" action={saveProfile}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                    Nome de exibição
                  </label>
                  <input
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white"
                    name="display_name"
                    defaultValue={profile?.display_name ?? ""}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                    Username (único)
                  </label>
                  <input
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white"
                    name="username"
                    defaultValue={profile?.username ?? ""}
                    placeholder="ex: piloto_cre"
                    required
                  />
                  <p className="mt-1 text-xs text-zinc-500">
                    3-20 caracteres: letras minúsculas, números ou "_".
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                    URL do avatar
                  </label>
                  <input
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white"
                    name="avatar_url"
                    defaultValue={profile?.avatar_url ?? ""}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                    URL do banner
                  </label>
                  <input
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white"
                    name="banner_url"
                    defaultValue={profile?.banner_url ?? ""}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                  Bio
                </label>
                <textarea
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white"
                  name="bio"
                  rows={3}
                  defaultValue={profile?.bio ?? ""}
                  placeholder="Conte sua história nas pistas"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                  Experiência como piloto
                </label>
                <textarea
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white"
                  name="experience"
                  rows={3}
                  defaultValue={profile?.experience ?? ""}
                  placeholder="Categorias, tempo de pista, equipes..."
                />
              </div>

              <button className="rounded-full bg-yellow-300 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-black">
                Salvar perfil
              </button>
            </form>
          </div>

          <div className="glass rounded-3xl p-6">
            <h2 className="font-display text-2xl tracking-[0.18em]">
              Vitórias e resultados
            </h2>
            <p className="mt-2 text-sm text-zinc-300">
              Adicione suas conquistas para deixar o perfil completo.
            </p>
            <form className="mt-6 grid gap-4" action={addVictory}>
              <input
                className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white"
                name="title"
                placeholder="Título da vitória"
                required
              />
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white"
                  name="track"
                  placeholder="Pista"
                />
                <input
                  className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white"
                  name="position"
                  placeholder="Posição (ex: 1º)"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white"
                  name="category"
                  placeholder="Categoria"
                />
                <input
                  className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white"
                  name="date"
                  type="date"
                />
              </div>
              <textarea
                className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white"
                name="notes"
                rows={3}
                placeholder="Observações ou experiência"
              />
              <button className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white">
                Adicionar vitória
              </button>
            </form>

            <div className="mt-8 grid gap-3">
              {safeVictories.length === 0 ? (
                <p className="text-sm text-zinc-400">
                  Nenhuma vitória cadastrada ainda.
                </p>
              ) : (
                safeVictories.map((victory) => (
                  <div
                    key={victory.id}
                    className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm uppercase tracking-[0.25em] text-yellow-300/80">
                        {victory.title}
                      </p>
                      <form action={deleteVictory}>
                        <input type="hidden" name="id" value={victory.id} />
                        <button className="text-xs uppercase tracking-[0.3em] text-red-300 hover:text-red-200">
                          Remover
                        </button>
                      </form>
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
          </div>
        </section>
      </div>
    </div>
  );
}
