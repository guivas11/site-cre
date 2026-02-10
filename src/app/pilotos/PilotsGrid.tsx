"use client";

import { useMemo, useState } from "react";

type Pilot = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  experience: string | null;
  bio: string | null;
};

type PilotsGridProps = {
  pilots: Pilot[];
  currentUserId: string | null;
};

export default function PilotsGrid({ pilots, currentUserId }: PilotsGridProps) {
  const [selected, setSelected] = useState<Pilot | null>(null);
  const [query, setQuery] = useState("");
  const sortedPilots = useMemo(
    () =>
      [...pilots].sort((a, b) =>
        (a.display_name || "").localeCompare(b.display_name || ""),
      ),
    [pilots],
  );
  const filteredPilots = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sortedPilots;
    return sortedPilots.filter((pilot) => {
      const name = (pilot.display_name || "").toLowerCase();
      const username = (pilot.username || "").toLowerCase();
      return name.includes(q) || username.includes(q);
    });
  }, [query, sortedPilots]);

  if (sortedPilots.length === 0) {
    return (
      <section className="glass rounded-3xl p-6 text-sm text-zinc-300">
        Nenhum piloto cadastrado ainda.
      </section>
    );
  }

  const isOwner = selected && currentUserId === selected.id;

  return (
    <>
      <div className="glass rounded-3xl p-4">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-zinc-200">
          <svg
            className="h-4 w-4 text-yellow-300/80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full bg-transparent text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none"
            placeholder="Buscar por username ou nome"
          />
        </div>
        {query && filteredPilots.length === 0 ? (
          <p className="mt-3 text-xs uppercase tracking-[0.3em] text-zinc-500">
            Nenhum piloto encontrado.
          </p>
        ) : null}
      </div>

      <section className="grid gap-6 md:grid-cols-2">
        {filteredPilots.map((pilot) => (
          <button
            key={pilot.id}
            type="button"
            onClick={() => setSelected(pilot)}
            className="group glass relative overflow-hidden rounded-3xl p-6 text-left transition hover:border-white/30"
          >
            <div
              className="absolute inset-0 opacity-40 transition group-hover:opacity-60"
              style={
                pilot.banner_url
                  ? {
                      backgroundImage: `url(${pilot.banner_url})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : undefined
              }
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/40 to-transparent" />
            <div className="relative flex items-center gap-4">
              <div className="h-14 w-14 overflow-hidden rounded-2xl border border-white/10 bg-black/60">
                {pilot.avatar_url ? (
                  <img
                    src={pilot.avatar_url}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
                    {pilot.display_name?.slice(0, 2).toUpperCase() || "CRE"}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {pilot.display_name || "Piloto CRE"}
                </p>
                <p className="text-xs uppercase tracking-[0.3em] text-yellow-300">
                  {pilot.username ? `@${pilot.username}` : "Sem username"}
                </p>
              </div>
            </div>
            <p className="relative mt-4 text-xs text-zinc-300">
              {pilot.experience || "Experiência não informada."}
            </p>
          </button>
        ))}
      </section>

      {selected ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-black/80 via-black/60 to-black/40 shadow-[0_30px_120px_rgba(0,0,0,0.6)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="relative h-48 w-full"
              style={
                selected.banner_url
                  ? {
                      backgroundImage: `url(${selected.banner_url})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : undefined
              }
            >
              <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
              <div className="absolute left-6 top-6 flex items-center gap-3">
                <span className="rounded-full border border-yellow-300/40 bg-yellow-300/10 px-4 py-2 text-[10px] uppercase tracking-[0.35em] text-yellow-200">
                  Perfil CRE
                </span>
                {isOwner ? (
                  <span className="rounded-full border border-blue-400/40 bg-blue-500/10 px-4 py-2 text-[10px] uppercase tracking-[0.35em] text-blue-200">
                    Seu perfil
                  </span>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="absolute right-5 top-5 rounded-full border border-white/30 bg-black/40 px-3 py-1 text-xs uppercase tracking-[0.3em] text-zinc-200 transition hover:border-white/60 hover:text-white"
              >
                Fechar
              </button>
              <div className="absolute bottom-0 left-0 flex w-full items-end gap-4 p-6">
                <div className="h-20 w-20 overflow-hidden rounded-2xl border border-white/10 bg-black/60">
                  {selected.avatar_url ? (
                    <img
                      src={selected.avatar_url}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
                      {selected.display_name?.slice(0, 2).toUpperCase() || "CRE"}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-yellow-300">
                    Piloto
                  </p>
                  <h2 className="font-display text-3xl tracking-[0.18em]">
                    {selected.display_name || "Piloto CRE"}
                  </h2>
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                    {selected.username ? `@${selected.username}` : "Sem username"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 p-6 sm:grid-cols-[0.9fr_1.1fr] sm:p-8">
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                    Experiência
                  </p>
                  <p className="mt-2 text-sm text-zinc-200">
                    {selected.experience || "Experiência não informada."}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                    Bio
                  </p>
                  <p className="mt-2 text-sm text-zinc-200">
                    {selected.bio || "Sem bio cadastrada."}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                {selected.username ? (
                  <a
                    href={`/pilotos/${encodeURIComponent(
                      selected.username.trim().toLowerCase(),
                    )}`}
                    className="rounded-full bg-yellow-300 px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-black transition hover:brightness-110"
                  >
                    Ver perfil completo
                  </a>
                ) : (
                  <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                    Perfil sem username
                  </p>
                )}
                {isOwner ? (
                  <a
                    href="/dashboard"
                    className="rounded-full border border-yellow-300/40 px-4 py-3 text-xs uppercase tracking-[0.25em] text-yellow-200 transition hover:border-yellow-300 hover:text-yellow-100"
                  >
                    Editar meu perfil
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-full border border-white/20 px-4 py-3 text-xs uppercase tracking-[0.25em] text-zinc-200 transition hover:border-white/50 hover:text-white"
                >
                  Voltar
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
