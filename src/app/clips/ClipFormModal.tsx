"use client";

import { useEffect, useRef, useState } from "react";
import ClipUpload from "./ClipUpload";

type ClipFormModalProps = {
  userId: string;
  action: (formData: FormData) => void;
};

export default function ClipFormModal({ userId, action }: ClipFormModalProps) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-yellow-300/50 bg-black/40 px-5 py-3 text-xs uppercase tracking-[0.3em] text-yellow-200 transition hover:border-yellow-300 hover:text-yellow-100"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
        Enviar clip
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center p-3 sm:p-6">
          <div
            className="absolute inset-0 bg-black/80"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={dialogRef}
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0f] text-white shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)] sm:rounded-3xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6 sm:py-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-yellow-300">
                  Enviar clip
                </p>
                <h2 className="mt-1 font-display text-xl tracking-[0.12em]">
                  Destaque sua corrida
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-zinc-400 transition hover:border-white/30 hover:text-white"
              >
                Fechar
              </button>
            </div>

            <form
              className="max-h-[72vh] overflow-y-auto px-4 py-4 scroll-smooth [scrollbar-width:thin] [scrollbar-color:rgba(255,214,79,0.7)_rgba(255,255,255,0.08)] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-thumb]:bg-yellow-300/60 [&::-webkit-scrollbar-thumb]:rounded-full sm:max-h-[75vh] sm:px-6 sm:py-5"
              action={action}
            >
              <div className="grid gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-400">
                    Titulo do clip
                  </label>
                  <input
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                    name="title"
                    placeholder="Ex: Ultima volta insana"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-400">
                    Descricao completa
                  </label>
                  <textarea
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                    name="description"
                    rows={4}
                    placeholder="Conte a historia do momento, contexto e estrategia."
                  />
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-400">
                      Categoria
                    </label>
                    <input
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                      name="category"
                      placeholder="F1, GT3, Stock..."
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-400">
                      Pista
                    </label>
                    <input
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                      name="track"
                      placeholder="Interlagos, Spa..."
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-400">
                    Tempo da volta
                  </label>
                  <input
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                    name="lap_time"
                    placeholder="1:32.550"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-400">
                    Upload do clip (ate 10 min)
                  </label>
                  <div className="mt-2">
                    <ClipUpload userId={userId} />
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/50 p-4">
                  <label className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                    Ou cole o link do YouTube
                  </label>
                  <input
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white"
                    name="youtube_url"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-zinc-400 transition hover:border-white/30 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-full border border-yellow-300/50 px-5 py-3 text-xs uppercase tracking-[0.3em] text-yellow-200 transition hover:border-yellow-300 hover:text-yellow-100"
                >
                  Publicar clip
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}











