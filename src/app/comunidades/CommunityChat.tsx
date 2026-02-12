"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Community = {
  id: string;
  title: string;
};

type Message = {
  id: string;
  community: string;
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  message: string;
  created_at: string;
};

type ProfileInfo = {
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
};

function formatTime(value: string) {
  try {
    return new Date(value).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function CommunityChat({
  community,
}: {
  community: Community;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isActive = true;
    const supabase = createClient();

    const load = async () => {
      setLoading(true);
      setError(null);

      const { data: userData } = await supabase.auth.getUser();
      if (!isActive) return;

      if (userData.user) {
        setUserId(userData.user.id);
        const { data: profileData } = await supabase
          .from("profiles")
          .select("display_name, username, avatar_url")
          .eq("id", userData.user.id)
          .maybeSingle();
        if (isActive) {
          setProfile(profileData || null);
        }
      } else {
        setUserId(null);
        setProfile(null);
      }

      const { data } = await supabase
        .from("community_messages")
        .select("*")
        .eq("community", community.id)
        .order("created_at", { ascending: true })
        .limit(120);

      if (isActive) {
        setMessages((data as Message[]) || []);
        setLoading(false);
      }
    };

    load();

    const channel = supabase
      .channel(`community-${community.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "community_messages",
          filter: `community=eq.${community.id}`,
        },
        (payload) => {
          const next = payload.new as Message;
          setMessages((prev) =>
            prev.some((item) => item.id === next.id) ? prev : [...prev, next],
          );
        },
      )
      .subscribe();

    return () => {
      isActive = false;
      supabase.removeChannel(channel);
    };
  }, [community.id]);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, community.id]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    if (!userId) {
      setError("Faça login para comentar.");
      return;
    }

    setSending(true);
    setError(null);

    const supabase = createClient();
    const { error: insertError } = await supabase
      .from("community_messages")
      .insert({
        id: crypto.randomUUID(),
        community: community.id,
        community_id: community.id,
        user_id: userId,
        message: text,
        content: text,
        display_name: profile?.display_name ?? "Piloto CRE",
        username: profile?.username ?? null,
        avatar_url: profile?.avatar_url ?? null,
      });

    if (insertError) {
      setError(`Nao foi possivel enviar a mensagem: ${insertError.message}`);
    } else {
      setInput("");
    }

    setSending(false);
  };

  return (
    <div className="flex min-h-[520px] flex-col rounded-2xl border border-white/10 bg-black/40 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-yellow-300/80">
            Chat da comunidade
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white">
            {community.title}
          </h3>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-zinc-400">
          Ao vivo
        </div>
      </div>

      <div className="mt-5 flex-1 overflow-y-auto rounded-2xl border border-white/10 bg-black/50 p-4">
        {loading ? (
          <p className="text-sm text-zinc-500">Carregando mensagens...</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Nenhuma mensagem ainda. Seja o primeiro.
          </p>
        ) : (
          <div className="grid gap-4">
            {messages.map((msg) => (
              <div key={msg.id} className="flex gap-3">
                <div className="h-9 w-9 overflow-hidden rounded-full border border-white/10 bg-black/60">
                  {msg.avatar_url ? (
                    <img
                      src={msg.avatar_url}
                      alt={msg.display_name || "Piloto"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-400">
                      {(msg.display_name || "P").slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <span className="uppercase tracking-[0.2em] text-zinc-300">
                      {msg.display_name || "Piloto CRE"}
                    </span>
                    {msg.username ? (
                      <span className="text-zinc-500">@{msg.username}</span>
                    ) : null}
                    <span className="text-zinc-600">
                      {formatTime(msg.created_at)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-200">{msg.message}</p>
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-2">
        {error ? (
          <p className="text-xs uppercase tracking-[0.3em] text-red-400">
            {error}
          </p>
        ) : null}
        <div className="flex items-center gap-3">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSend();
              }
            }}
            placeholder="Escreva sua mensagem"
            className="h-11 flex-1 rounded-full border border-white/10 bg-black/60 px-5 text-sm text-white placeholder:text-zinc-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className="h-11 rounded-full border border-white/15 px-5 text-xs uppercase tracking-[0.3em] text-zinc-200 transition hover:border-white/40 hover:text-white disabled:opacity-50"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}








