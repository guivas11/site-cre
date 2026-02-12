"use client";

import { useRouter } from "next/navigation";

export default function BackToPreviousButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
          return;
        }
        router.push("/pilotos");
      }}
      className="inline-flex w-fit rounded-full border border-white/20 px-5 py-3 text-xs uppercase tracking-[0.25em] text-zinc-200 transition hover:border-white/50 hover:text-white"
    >
      Voltar
    </button>
  );
}

