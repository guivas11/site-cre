"use client";

import { useState } from "react";

type ProfileTabsProps = {
  overview: React.ReactNode;
  races: React.ReactNode;
  times: React.ReactNode;
};

export default function ProfileTabs({ overview, races, times }: ProfileTabsProps) {
  const [tab, setTab] = useState<"overview" | "races" | "times">("overview");

  return (
    <div className="glass rounded-2xl p-4 sm:p-6 md:rounded-3xl md:p-8">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setTab("overview")}
          className={`rounded-full px-5 py-2 text-xs uppercase tracking-[0.25em] transition ${
            tab === "overview"
              ? "bg-yellow-300 text-black"
              : "border border-white/20 text-zinc-200 hover:border-white/50 hover:text-white"
          }`}
        >
          Perfil
        </button>
        <button
          type="button"
          onClick={() => setTab("races")}
          className={`rounded-full px-5 py-2 text-xs uppercase tracking-[0.25em] transition ${
            tab === "races"
              ? "bg-yellow-300 text-black"
              : "border border-white/20 text-zinc-200 hover:border-white/50 hover:text-white"
          }`}
        >
          Corridas
        </button>
        <button
          type="button"
          onClick={() => setTab("times")}
          className={`rounded-full px-5 py-2 text-xs uppercase tracking-[0.25em] transition ${
            tab === "times"
              ? "bg-yellow-300 text-black"
              : "border border-white/20 text-zinc-200 hover:border-white/50 hover:text-white"
          }`}
        >
          Tempos
        </button>
      </div>

      <div className="mt-6">
        {tab === "overview" ? overview : null}
        {tab === "races" ? races : null}
        {tab === "times" ? times : null}
      </div>
    </div>
  );
}

