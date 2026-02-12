"use client";

import { useEffect, useMemo, useState } from "react";

type LeaderEntry = {
  name: string;
  time: string;
};

type TrackLeader = {
  track: string;
  entries: LeaderEntry[];
};

type TrackLeadersProps = {
  leaders: TrackLeader[];
};

export default function TrackLeaders({ leaders }: TrackLeadersProps) {
  const list = useMemo(
    () => leaders.filter((track) => track.entries.length > 0),
    [leaders],
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (list.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % list.length);
    }, 3500);
    return () => window.clearInterval(id);
  }, [list.length]);

  if (list.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-xs uppercase tracking-[0.3em] text-zinc-400">
        Sem tempos registrados ainda
      </div>
    );
  }

  const current = list[index];
  const nextIndex = (index + 1) % list.length;
  const nextTrack = list[nextIndex]?.track;

  return (
    <div key={current.track} className="animate-fade-slide">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/50">
        <div className="primary-stripe h-[2px] opacity-80" />
        <div className="px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <p className="line-clamp-1 text-xs uppercase tracking-[0.3em] text-zinc-200">
              {current.track}
            </p>
            <span className="rounded-full border border-white/10 bg-black/60 px-2 py-1 text-[10px] uppercase tracking-[0.25em] text-zinc-400">
              Pista {index + 1}/{list.length}
            </span>
          </div>

          <div className="mt-3 grid gap-2">
            {current.entries.map((entry, idx) => (
              <div
                key={`${entry.name}-${entry.time}-${idx}`}
                className={`flex items-center justify-between rounded-xl px-3 py-2 ${
                  idx === 0
                    ? "border border-yellow-400/35 bg-gradient-to-r from-yellow-500/20 to-black/40"
                    : "border border-white/10 bg-black/40"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-6 min-w-6 items-center justify-center rounded-full text-[10px] ${
                      idx === 0
                        ? "border border-yellow-400/40 bg-yellow-500/20 text-yellow-300"
                        : "border border-white/10 bg-black/60 text-zinc-300"
                    }`}
                  >
                    P{idx + 1}
                  </span>
                  <span className="max-w-[11rem] truncate text-sm text-white">
                    {entry.name}
                  </span>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    idx === 0 ? "text-yellow-300" : "text-zinc-200"
                  }`}
                >
                  {entry.time}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {list.map((item, dotIndex) => (
                <span
                  key={item.track}
                  className={`h-1.5 rounded-full transition-all ${
                    dotIndex === index
                      ? "w-5 bg-yellow-300"
                      : "w-1.5 bg-white/20"
                  }`}
                />
              ))}
            </div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">
              Proxima: {nextTrack}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

