"use client";

import { ReactNode, useEffect, useState } from "react";

type ProfileBannerProps = {
  displayName: string;
  username?: string | null;
  favoriteTrack?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  stats: {
    races: number;
    wins: number;
    podiums: number;
  };
  actions?: ReactNode;
};

export default function ProfileBanner({
  displayName,
  username,
  favoriteTrack,
  avatarUrl,
  bannerUrl,
  stats,
  actions,
}: ProfileBannerProps) {
  const [avatar, setAvatar] = useState(avatarUrl || "");
  const [banner, setBanner] = useState(bannerUrl || "");
  const [liveName, setLiveName] = useState(displayName);
  const [liveUsername, setLiveUsername] = useState(username || "");
  const [liveTrack, setLiveTrack] = useState(favoriteTrack || "");

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ name: string; url?: string }>).detail;
      if (!detail?.name) return;
      if (detail.name === "avatar_url") setAvatar(detail.url || "");
      if (detail.name === "banner_url") setBanner(detail.url || "");
    };
    window.addEventListener("profile-image-updated", handler as EventListener);
    return () =>
      window.removeEventListener("profile-image-updated", handler as EventListener);
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ name: string; value: string }>).detail;
      if (!detail?.name) return;
      if (detail.name === "display_name") setLiveName(detail.value);
      if (detail.name === "username") setLiveUsername(detail.value);
      if (detail.name === "favorite_track") setLiveTrack(detail.value);
    };
    window.addEventListener("profile-field-updated", handler as EventListener);
    return () =>
      window.removeEventListener("profile-field-updated", handler as EventListener);
  }, []);

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/15 bg-black/70 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_20px_45px_-30px_rgba(0,0,0,0.9)]"
      style={
        banner
          ? {
              backgroundImage: `url(${banner})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
      {actions ? (
        <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
          {actions}
        </div>
      ) : null}
      <div className="relative flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="h-16 w-16 overflow-hidden rounded-2xl border border-white/10 bg-black/60">
            {avatar ? (
              <img
                src={avatar}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-zinc-400">
                {liveName.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-zinc-400">
              <svg
                className="h-3.5 w-3.5 text-yellow-300/80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 12c2.761 0 5-2.239 5-5" />
                <path d="M7 7c0 2.761 2.239 5 5 5" />
                <path d="M5 21c1.5-4 5-6 7-6s5.5 2 7 6" />
              </svg>
              Perfil do piloto
            </div>
            <h2 className="font-display text-2xl tracking-[0.12em]">
              {liveName || "Piloto CRE"}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-zinc-200">
              {liveUsername ? (
                <span className="rounded-full border border-yellow-300/40 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-yellow-200">
                  @{liveUsername}
                </span>
              ) : null}
              <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-zinc-300">
                {liveTrack || "Sem pista favorita"}
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-[10px] uppercase tracking-[0.22em] text-zinc-400 sm:max-w-[320px]">
          <div className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2">
            <p className="text-base font-semibold text-yellow-200">
              {stats.races}
            </p>
            <p>Corridas</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2">
            <p className="text-base font-semibold text-yellow-200">
              {stats.wins}
            </p>
            <p>Vitórias</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2">
            <p className="text-base font-semibold text-yellow-200">
              {stats.podiums}
            </p>
            <p>Pódios</p>
          </div>
        </div>
      </div>
    </div>
  );
}


