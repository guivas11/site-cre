import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  addVictory,
  deleteVictory,
  saveProfile,
  signOut,
  upsertLapTime,
} from "./actions";
import DashboardTabs from "./DashboardTabs";
import { f1Tracks } from "@/lib/f1Tracks";
import TrackSelect from "./TrackSelect";
import UploadField from "./UploadField";
import FormSaveToast from "./FormSaveToast";
import ProfileBanner from "./ProfileBanner";

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

  const { data: lapTimes } = await supabase
    .from("lap_times")
    .select("*")
    .eq("user_id", data.user.id)
    .order("track", { ascending: true });
  const safeLapTimes = lapTimes ?? [];
  const lapTimesMap = safeLapTimes.reduce<Record<string, string>>(
    (acc, row) => {
      acc[row.track] = row.time;
      return acc;
    },
    {},
  );

  return (
    <div className="min-h-screen racing-bg text-white" suppressHydrationWarning>
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
          <div className="flex items-center gap-3">
            <a
              className="rounded-full border border-white/20 px-5 py-3 text-xs uppercase tracking-[0.25em] text-zinc-200 transition hover:border-white/50 hover:text-white"
              href="/"
            >
              Voltar para a home
            </a>
            <form action={signOut}>
              <button className="rounded-full border border-red-500/60 px-5 py-3 text-xs uppercase tracking-[0.25em] text-red-200 transition hover:border-red-400 hover:text-red-100">
                Sair
              </button>
            </form>
          </div>
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

        <DashboardTabs
          profileContent={
            <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="glass rounded-3xl p-6">
                <ProfileBanner
                  displayName={profile?.display_name || "Piloto CRE"}
                  username={profile?.username}
                  favoriteTrack={profile?.favorite_track}
                  avatarUrl={profile?.avatar_url}
                  bannerUrl={profile?.banner_url}
                  stats={{
                    races: safeVictories.length,
                    wins: safeVictories.filter((victory) => {
                      const position = victory.position?.toString().trim() ?? "";
                      return ["1º", "1", "p1", "1o", "1°"].includes(
                        position.toLowerCase(),
                      );
                    }).length,
                    podiums: safeVictories.filter((victory) => {
                      const position = victory.position?.toString().trim() ?? "";
                      return ["1º", "2º", "3º", "1", "2", "3", "p1", "p2", "p3", "1o", "2o", "3o", "1°", "2°", "3°"].includes(
                        position.toLowerCase(),
                      );
                    }).length,
                  }}
                  actions={
                    <>
                <UploadField
                  label="Avatar"
                  name="avatar_url"
                  bucket="avatars"
                  userId={data.user.id}
                  defaultValue={profile?.avatar_url ?? ""}
                  variant="icon"
                  hideLabel
                  formId="profile-form"
                />
                <UploadField
                  label="Banner"
                  name="banner_url"
                  bucket="banners"
                  userId={data.user.id}
                  defaultValue={profile?.banner_url ?? ""}
                  variant="icon"
                  hideLabel
                  formId="profile-form"
                />
                    </>
                  }
                />

                <form id="profile-form" className="mt-6 grid gap-6" action={saveProfile}>
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-zinc-400">
                    <svg
                      className="h-3.5 w-3.5 text-yellow-300/70"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8" />
                      <path d="M4 21v-2a4 4 0 0 1 4-4h8" />
                      <circle cx="12" cy="7" r="3" />
                    </svg>
                    Identidade
                  </div>
                    <div className="mt-3 grid gap-4 md:grid-cols-2">
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
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-zinc-400">
                      <svg
                        className="h-3.5 w-3.5 text-yellow-300/70"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M12 21s-6-4.35-6-10a6 6 0 0 1 12 0c0 5.65-6 10-6 10z" />
                        <circle cx="12" cy="11" r="2" />
                      </svg>
                      Preferências
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <label className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                          Pista favorita (F1)
                        </label>
                        <div className="mt-2">
                          <TrackSelect
                            name="favorite_track"
                            defaultValue={profile?.favorite_track ?? ""}
                          />
                        </div>
                        <p className="mt-2 text-xs text-zinc-500">
                          Isso aparece no card do seu perfil.
                        </p>
                      </div>
                      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-white/10 bg-black/60 p-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                            Imagem da pista
                          </p>
                          <p className="mt-2 text-xs text-zinc-500">
                            Suba uma imagem discreta do circuito.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <UploadField
                            label="Imagem da pista"
                            name="favorite_track_image"
                            bucket="tracks"
                            userId={data.user.id}
                            defaultValue={profile?.favorite_track_image ?? ""}
                            variant="icon"
                            hideLabel
                            formId="profile-form"
                          />
                          <span className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                            Trocar imagem
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-zinc-400">
                      <svg
                        className="h-3.5 w-3.5 text-yellow-300/70"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M21 15a4 4 0 0 1-4 4H7l-4 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                      </svg>
                      Sobre você
                    </div>
                    <p className="mt-2 text-xs text-zinc-500">
                      Conte rapidamente sua trajetória e seu estilo de pilotagem.
                    </p>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-black/60 p-4">
                        <label className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                          Bio
                        </label>
                        <textarea
                          className="dashboard-textarea mt-2 h-28 w-full resize-none rounded-2xl border border-white/10 bg-black/70 px-4 py-3 text-sm text-white"
                          name="bio"
                          rows={4}
                          defaultValue={profile?.bio ?? ""}
                          placeholder="Conte sua história nas pistas"
                        />
                        <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                          1-2 frases objetivas
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/60 p-4">
                        <label className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                          Experiência como piloto
                        </label>
                        <textarea
                          className="dashboard-textarea mt-2 h-28 w-full resize-none rounded-2xl border border-white/10 bg-black/70 px-4 py-3 text-sm text-white"
                          name="experience"
                          rows={4}
                          defaultValue={profile?.experience ?? ""}
                          placeholder="Categorias, tempo de pista, equipes..."
                        />
                        <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                          Detalhes rápidos
                        </p>
                      </div>
                    </div>
                  </div>

                  <button className="inline-flex items-center justify-center gap-2 rounded-full border border-yellow-300/50 bg-yellow-300/10 px-6 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-yellow-200 transition hover:-translate-y-0.5 hover:border-yellow-300 hover:bg-yellow-300/20 active:translate-y-0">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                      <path d="M17 21v-8H7v8" />
                      <path d="M7 3v5h8" />
                    </svg>
                    Salvar perfil
                  </button>
                </form>
                <FormSaveToast formId="profile-form" />
              </div>

              <div className="glass rounded-3xl p-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-2xl tracking-[0.18em]">Vitórias e resultados</h2>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-zinc-400">
                    <svg className="h-3.5 w-3.5 text-yellow-300/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M8 21h8" />
                      <path d="M12 17v4" />
                      <path d="M7 4h10v6a5 5 0 0 1-10 0z" />
                      <path d="M5 4h2v2a3 3 0 0 1-3 3H3V7a3 3 0 0 1 3-3z" />
                      <path d="M19 4h2a3 3 0 0 1 3 3v2h-1a3 3 0 0 1-3-3V4z" />
                    </svg>
                    Registros
                  </div>
                </div>
            <p className="mt-2 text-sm text-zinc-300">
              Adicione suas conquistas para deixar o perfil completo.
            </p>
            <div className="mt-5 grid gap-3 rounded-2xl border border-white/10 bg-black/50 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                Resumo rápido
              </p>
              <div className="grid gap-2 text-sm text-zinc-200">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Piloto</span>
                  <span>{profile?.display_name || "Piloto CRE"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Username</span>
                  <span>{profile?.username ? `@${profile.username}` : "--"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Pista favorita</span>
                  <span>{profile?.favorite_track || "--"}</span>
                </div>
              </div>
            </div>
            <form className="mt-6 grid gap-4" action={addVictory}>
              <div className="grid gap-4 rounded-2xl border border-white/10 bg-black/50 p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                    name="title"
                    placeholder="Título da vitória"
                    required
                  />
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                    name="track"
                    placeholder="Pista"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                    name="position"
                    placeholder="Posição (ex: 1º)"
                  />
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                    name="category"
                    placeholder="Categoria"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                    name="date"
                    type="date"
                  />
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                    name="notes"
                    placeholder="Observações ou experiência"
                  />
                </div>
              </div>
              <button className="inline-flex items-center justify-center gap-2 rounded-full border border-blue-400/40 bg-blue-500/10 px-6 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-blue-200 transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-500/20 active:translate-y-0">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
                Adicionar vitória
              </button>
            </form>

            <div className="mt-8 grid gap-3 md:grid-cols-2">
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
                      {victory.position ? `Â· ${victory.position}` : ""}
                      {victory.category ? ` Â· ${victory.category}` : ""}
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
          }
          lapTimesContent={
            <section className="glass rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl tracking-[0.18em]">
                  Tempos de volta (F1)
                </h2>
                <span className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                  Formato 1:23.456
                </span>
              </div>
              <p className="mt-3 text-sm text-zinc-300">
                Escolha a pista e registre seu melhor tempo. Isso aparece no seu
                perfil público.
              </p>
              <form className="mt-6 flex flex-col gap-4" action={upsertLapTime}>
                <div className="grid gap-4 md:grid-cols-[1.4fr_0.6fr]">
                  <TrackSelect name="track" required />
                  <input
                    name="time"
                    className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white"
                    placeholder="1:23.456"
                    required
                  />
                </div>
                <button className="rounded-full bg-yellow-300 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-black">
                  Salvar tempo
                </button>
              </form>

              <div className="mt-8 grid gap-3 md:grid-cols-2">
                {f1Tracks.map((track) => (
                  <div
                    key={track}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <p className="text-sm text-zinc-200">{track}</p>
                    <span className="text-sm text-yellow-300">
                      {lapTimesMap[track] || "--:--.---"}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          }
        />

        <section className="glass rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl tracking-[0.18em]">
              Estatísticas (automático)
            </h2>
            <span className="text-xs uppercase tracking-[0.3em] text-zinc-400">
              Baseado nas corridas
            </span>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
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
                {safeVictories.filter((victory) => {
                  const position = victory.position?.toString().trim() ?? "";
                  return ["1º", "1", "p1", "1o", "1Â°"].includes(
                    position.toLowerCase(),
                  );
                }).length}
              </p>
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                Vitórias
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xl font-semibold text-yellow-300">
                {safeVictories.filter((victory) => {
                  const position = victory.position?.toString().trim() ?? "";
                  return ["1º", "2Âº", "3Âº", "1", "2", "3", "p1", "p2", "p3", "1o", "2o", "3o", "1Â°", "2Â°", "3Â°"].includes(
                    position.toLowerCase(),
                  );
                }).length}
              </p>
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                Pódios
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                Última corrida
              </p>
              <p className="mt-1 text-sm text-zinc-200">
                {safeVictories[0]?.track || "Não informada"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                Último resultado
              </p>
              <p className="mt-1 text-sm text-zinc-200">
                {safeVictories[0]?.title || "Sem resultados"}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}













