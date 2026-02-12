"use client";

import { useState } from "react";

type DashboardTabsProps = {
  profileContent: React.ReactNode;
  lapTimesContent: React.ReactNode;
};

export default function DashboardTabs({
  profileContent,
  lapTimesContent,
}: DashboardTabsProps) {
  const [tab, setTab] = useState<"profile" | "laps">("profile");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setTab("profile")}
          className={`rounded-full px-5 py-2 text-xs uppercase tracking-[0.25em] transition ${
            tab === "profile"
              ? "bg-yellow-300 text-black"
              : "border border-white/20 text-zinc-200 hover:border-white/50 hover:text-white"
          }`}
        >
          Perfil
        </button>
        <button
          type="button"
          onClick={() => setTab("laps")}
          className={`rounded-full px-5 py-2 text-xs uppercase tracking-[0.25em] transition ${
            tab === "laps"
              ? "bg-yellow-300 text-black"
              : "border border-white/20 text-zinc-200 hover:border-white/50 hover:text-white"
          }`}
        >
          Tempos de volta
        </button>
      </div>

      {tab === "profile" ? (
        <div key="profile">{profileContent}</div>
      ) : (
        <div key="laps">{lapTimesContent}</div>
      )}
    </div>
  );
}

