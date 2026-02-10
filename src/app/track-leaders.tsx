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
  tracks: TrackLeader[];
};

export default function TrackLeaders({ tracks }: TrackLeadersProps) {
  const list = useMemo(
    () => tracks.filter((track) => track.entries.length > 0),
    [tracks],
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
      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.3em] text-zinc-400">
        Sem tempos registrados ainda
      </div>
    );
  }

  const current = list[index];

  return (
    <div key={current.track} className="animate-fade-slide">
      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
          {current.track}
        </p>
        <div className="mt-3 grid gap-2">
          {current.entries.map((entry, idx) => (
            <div
              key={`${entry.name}-${entry.time}-${idx}`}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-black/60 text-[10px] text-zinc-300">
                  {idx + 1}
                </span>
                <span className="text-sm text-white">{entry.name}</span>
              </div>
              <span className="text-sm text-yellow-300">{entry.time}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 text-[10px] uppercase tracking-[0.35em] text-zinc-500">
        Próxima pista em instantes
      </p>
    </div>
  );
}
