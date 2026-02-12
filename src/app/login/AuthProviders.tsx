"use client";

import { createClient } from "@/lib/supabase/client";

const providers = [
  { id: "google", label: "Google" },
  { id: "github", label: "GitHub" },
  { id: "discord", label: "Discord" },
] as const;

export default function AuthProviders() {
  const handleLogin = async (provider: "google" | "github" | "discord") => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="mt-4 flex items-center gap-3">
      {providers.map((provider) => (
        <button
          key={provider.id}
          type="button"
          aria-label={`Entrar com ${provider.label}`}
          title={`Entrar com ${provider.label}`}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/80 transition hover:border-white/40 hover:text-white"
          onClick={() => handleLogin(provider.id)}
        >
          {provider.id === "google" ? (
            <svg
              viewBox="0 0 48 48"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                d="M44.5 20H24v8.5h11.7C34.2 33.7 29.5 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 3l5.7-5.7C34.1 5.1 29.3 3 24 3 12.9 3 4 11.9 4 23s8.9 20 20 20c10.6 0 19.5-7.7 19.5-20 0-1.2-.1-2.1-.3-3z"
                fill="#FFC107"
              />
              <path
                d="M6.3 14.3l6.6 4.8C14.8 14.8 19 12 24 12c3.1 0 5.9 1.1 8.1 3l5.7-5.7C34.1 5.1 29.3 3 24 3 16.1 3 9.3 7.5 6.3 14.3z"
                fill="#FF3D00"
              />
              <path
                d="M24 43c5.4 0 10-1.8 13.3-4.9l-6.1-5.2C29.1 34.8 26.7 36 24 36c-5.5 0-10.2-3.7-11.9-8.7l-6.7 5.1C8.3 39 15.6 43 24 43z"
                fill="#4CAF50"
              />
              <path
                d="M44.5 20H24v8.5h11.7c-1 2.7-3 4.9-5.6 6.4l6.1 5.2C39.9 36.7 44.5 31.2 44.5 23c0-1.2-.1-2.1-.3-3z"
                fill="#1976D2"
              />
            </svg>
          ) : null}
          {provider.id === "github" ? (
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M12 .5C5.7.5.6 5.6.6 11.9c0 5 3.2 9.2 7.7 10.7.6.1.8-.3.8-.6v-2.1c-3.1.7-3.7-1.5-3.7-1.5-.5-1.2-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 .1.7 2.2 3 1.6.1-.7.4-1.2.7-1.5-2.5-.3-5.2-1.2-5.2-5.6 0-1.2.4-2.2 1.1-3-.1-.3-.5-1.4.1-3 0 0 .9-.3 3 .9.9-.2 1.8-.3 2.7-.3.9 0 1.8.1 2.7.3 2.1-1.2 3-.9 3-.9.6 1.6.2 2.7.1 3 .7.8 1.1 1.8 1.1 3 0 4.4-2.7 5.3-5.2 5.6.4.3.8 1 .8 2.1v3.1c0 .3.2.7.8.6 4.5-1.5 7.7-5.7 7.7-10.7C23.4 5.6 18.3.5 12 .5z"
              />
            </svg>
          ) : null}
          {provider.id === "discord" ? (
            <svg
              viewBox="0 0 245 240"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M104.4 104.9c-5.7 0-10.2 5-10.2 11.1 0 6.1 4.6 11.1 10.2 11.1 5.7 0 10.2-5 10.2-11.1.1-6.1-4.5-11.1-10.2-11.1zm36.2 0c-5.7 0-10.2 5-10.2 11.1 0 6.1 4.6 11.1 10.2 11.1 5.7 0 10.2-5 10.2-11.1 0-6.1-4.5-11.1-10.2-11.1z"
              />
              <path
                fill="currentColor"
                d="M189.5 20h-134C39 20 24 35 24 53.5v129c0 18.5 15 33.5 33.5 33.5h113.5l-5.3-18.5 12.8 11.9 12.1 11.2L221 240V53.5c0-18.5-15-33.5-33.5-33.5zm-39.9 136.1s-3.7-4.4-6.8-8.3c13.5-3.8 18.6-12.3 18.6-12.3-4.2 2.8-8.2 4.8-11.8 6.1-5.1 2.1-10 3.4-14.8 4.2-9.8 1.8-18.8 1.3-26.7-.1-6-1.1-11.2-2.6-15.6-4.2-2.5-.9-5.2-2-7.9-3.5-.3-.2-.6-.3-.9-.5-.2-.1-.3-.2-.4-.3-1.8-1-2.8-1.7-2.8-1.7s4.9 8.2 17.9 12.2c-3.1 3.9-6.9 8.5-6.9 8.5-22.8-.7-31.5-15.7-31.5-15.7 0-33.2 14.8-60.1 14.8-60.1 14.8-11.1 28.9-10.8 28.9-10.8l1 1.2c-18.5 5.3-27 13.5-27 13.5s2.3-1.3 6.1-3.1c11-4.8 19.7-6.1 23.3-6.4.6-.1 1.1-.2 1.7-.2 6.1-.8 13-.9 20.1-.2 9.4 1.1 19.5 4.1 29.7 10.1 0 0-8.1-7.7-25.6-13l1.4-1.6s14.1-.3 28.9 10.8c0 0 14.8 26.9 14.8 60.1 0 0-8.7 15-31.6 15.7z"
              />
            </svg>
          ) : null}
        </button>
      ))}
    </div>
  );
}

