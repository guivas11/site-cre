"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    let isActive = true;

    const run = async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);

      if (!isActive) {
        return;
      }

      if (error) {
        router.replace("/login?error=Falha%20ao%20autenticar.%20Tente%20novamente.");
        return;
      }

      const response = await fetch("/api/auth/ensure-username", {
        method: "POST",
      });
      if (!response.ok) {
        router.replace("/dashboard");
        return;
      }

      const data = (await response.json()) as { username?: string };
      if (data.username) {
        router.replace(`/pilotos/${data.username}`);
        return;
      }

      router.replace("/dashboard");
    };

    run();

    return () => {
      isActive = false;
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 text-center md:px-6">
        <div className="glass w-full rounded-3xl p-8">
          <p className="text-xs uppercase tracking-[0.4em] text-yellow-300/80">Autenticacao</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">Concluindo login...</h1>
          <p className="mt-3 text-sm text-zinc-400">Aguarde enquanto sincronizamos seu perfil.</p>
        </div>
      </div>
    </div>
  );
}
