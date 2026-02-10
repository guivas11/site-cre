"use client";

import { useMemo, useState } from "react";
import CommunityChat from "./CommunityChat";

type Community = {
  id: string;
  title: string;
  description: string;
  tag: string;
};

type Announcement = {
  id: string;
  community_id: string;
  title: string;
  content: string;
  date: string;
};

export default function CommunityHub({
  communities,
  announcements,
}: {
  communities: Community[];
  announcements: Announcement[];
}) {
  const [activeId, setActiveId] = useState(communities[0]?.id ?? "");
  const active = useMemo(
    () => communities.find((item) => item.id === activeId) ?? communities[0],
    [activeId, communities],
  );

  const activeAnnouncements = useMemo(
    () => announcements.filter((item) => item.community_id === active?.id),
    [announcements, active],
  );

  return (
    <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="grid gap-4">
        {communities.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveId(item.id)}
            className={`rounded-2xl border px-4 py-4 text-left transition ${
              active?.id === item.id
                ? "border-yellow-300/60 bg-yellow-300/10"
                : "border-white/10 bg-white/5 hover:border-white/25"
            }`}
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-zinc-400">
              <span className="rounded-full bg-blue-600 px-3 py-1 text-[10px] text-white">
                {item.tag}
              </span>
            </div>
            <h3 className="mt-3 text-lg font-semibold text-white">
              {item.title}
            </h3>
            <p className="mt-2 text-sm text-zinc-300">{item.description}</p>
          </button>
        ))}
      </div>

      {active ? (
        <div className="grid gap-4">
          <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.35em] text-yellow-300">
                Mural de anuncios
              </p>
              <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                Fixado
              </span>
            </div>
            <div className="mt-4 grid gap-3">
              {activeAnnouncements.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  Nenhum anuncio para esta comunidade.
                </p>
              ) : (
                activeAnnouncements.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-white/10 bg-black/60 p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                      {item.date}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {item.title}
                    </p>
                    <p className="mt-2 text-sm text-zinc-300">
                      {item.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
          <CommunityChat community={active} />
        </div>
      ) : null}
    </div>
  );
}