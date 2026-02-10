"use client";

import { useEffect, useState } from "react";

type EventReminderProps = {
  title: string;
  startAt: string;
};

export default function EventReminder({ title, startAt }: EventReminderProps) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("cre:event-reminder");
    if (stored === "true") {
      setEnabled(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cre:event-reminder", enabled ? "true" : "false");
  }, [enabled]);

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
          Lembrete local
        </p>
        <p className="text-sm text-white">
          {title} - {new Date(startAt).toLocaleString("pt-BR")}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setEnabled((prev) => !prev)}
        className={`rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.3em] transition ${
          enabled
            ? "border-yellow-300/60 bg-yellow-300/10 text-yellow-200"
            : "border-white/15 text-zinc-300 hover:border-white/40 hover:text-white"
        }`}
      >
        {enabled ? "Ativo" : "Ativar"}
      </button>
    </div>
  );
}
