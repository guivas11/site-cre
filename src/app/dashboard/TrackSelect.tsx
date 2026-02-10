"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { f1Tracks } from "@/lib/f1Tracks";

type TrackSelectProps = {
  name: string;
  required?: boolean;
  defaultValue?: string | null;
};

export default function TrackSelect({
  name,
  required,
  defaultValue,
}: TrackSelectProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue || "");
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return f1Tracks;
    return f1Tracks.filter((track) => track.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (wrapperRef.current.contains(event.target as Node)) return;
      setOpen(false);
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <input type="hidden" name={name} value={value} required={required} />
      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white focus-within:border-yellow-300/60">
        <input
          value={query || value}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Escolha a pista"
          className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="text-yellow-300"
          aria-label="Abrir lista de pistas"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4">
            <path fill="currentColor" d="M7 10l5 5 5-5H7z" />
          </svg>
        </button>
      </div>

      {open ? (
        <div className="track-scroll absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-2xl border border-white/10 bg-black/90 shadow-xl backdrop-blur">
          {items.length === 0 ? (
            <div className="px-4 py-3 text-xs text-zinc-400">
              Nenhuma pista encontrada.
            </div>
          ) : (
            items.map((track) => (
              <button
                key={track}
                type="button"
                onClick={() => {
                  setValue(track);
                  setQuery("");
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-zinc-200 transition hover:bg-white/5"
              >
                <span>{track}</span>
                {value === track ? (
                  <span className="text-xs uppercase tracking-[0.25em] text-yellow-300">
                    Selecionado
                  </span>
                ) : null}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
