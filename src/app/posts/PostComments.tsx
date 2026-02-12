"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type CommentItem = {
  id: string;
  post_id: string;
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  content: string;
  is_hidden: boolean;
  created_at: string;
};

type PostCommentsProps = {
  postId: string;
  userId: string | null;
  isAdmin: boolean;
  isBanned: boolean;
};

function timeLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PostComments({
  postId,
  userId,
  isAdmin,
  isBanned,
}: PostCommentsProps) {
  const supabase = useMemo(() => createClient(), []);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [profileUsername, setProfileUsername] = useState<string | null>(null);
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  const normalizeComment = (row: Record<string, unknown>): CommentItem => ({
    id: String(row.id ?? ""),
    post_id: String(row.post_id ?? ""),
    user_id: String(row.user_id ?? ""),
    display_name: (row.display_name as string | null) ?? null,
    username: (row.username as string | null) ?? null,
    avatar_url: (row.avatar_url as string | null) ?? null,
    content:
      String(
        (row.content as string | null) ??
          (row.message as string | null) ??
          "",
      ) || "",
    is_hidden: Boolean(row.is_hidden),
    created_at: String(row.created_at ?? new Date().toISOString()),
  });

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("post_comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true })
        .limit(300);

      if (active) {
        const rows = (data as Record<string, unknown>[] | null) ?? [];
        setComments(rows.map(normalizeComment));
        setLoading(false);
      }

      if (userId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, username, avatar_url")
          .eq("id", userId)
          .maybeSingle();

        if (active) {
          setProfileName(profile?.display_name ?? null);
          setProfileUsername(profile?.username ?? null);
          setProfileAvatar(profile?.avatar_url ?? null);
        }
      }
    };

    load();

    const channel = supabase
      .channel(`post-comments-${postId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "post_comments",
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          const event = payload.eventType;
          const nextRow = normalizeComment(
            (payload.new as Record<string, unknown>) ?? {},
          );
          const oldRow = normalizeComment(
            (payload.old as Record<string, unknown>) ?? {},
          );

          setComments((prev) => {
            if (event === "INSERT") {
              if (prev.some((item) => item.id === nextRow.id)) return prev;
              return [...prev, nextRow];
            }

            if (event === "UPDATE") {
              return prev.map((item) =>
                item.id === nextRow.id ? { ...item, ...nextRow } : item,
              );
            }

            if (event === "DELETE") {
              return prev.filter((item) => item.id !== oldRow.id);
            }

            return prev;
          });
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [postId, supabase, userId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments.length]);

  const handleSend = async () => {
    const content = text.trim();
    if (!content || sending) return;

    if (!userId) {
      setError("Faça login para comentar.");
      return;
    }

    if (isBanned) {
      setError("Sua conta esta bloqueada para comentar.");
      return;
    }

    setSending(true);
    setError(null);

    const basePayload = {
      post_id: postId,
      user_id: userId,
      display_name: profileName,
      username: profileUsername,
      avatar_url: profileAvatar,
    };

    const attempts: Array<Record<string, unknown>> = [
      { ...basePayload, content },
      { ...basePayload, message: content },
      { id: crypto.randomUUID(), ...basePayload, content },
      { id: crypto.randomUUID(), ...basePayload, message: content },
    ];

    let insertError: { message?: string } | null = null;

    for (const payload of attempts) {
      const result = await supabase.from("post_comments").insert(payload);
      if (!result.error) {
        insertError = null;
        break;
      }
      insertError = result.error;
    }

    if (insertError) {
      setError(
        `Nao foi possivel enviar o comentario: ${insertError.message ?? "erro desconhecido"}`,
      );
      setSending(false);
      return;
    }

    setText("");
    setSending(false);
  };

  const handleToggleHidden = async (item: CommentItem) => {
    if (!isAdmin) return;
    await supabase
      .from("post_comments")
      .update({
        is_hidden: !item.is_hidden,
        moderated_at: new Date().toISOString(),
      })
      .eq("id", item.id);
  };

  const handleDelete = async (item: CommentItem) => {
    if (!userId) return;
    if (item.user_id !== userId && !isAdmin) return;
    await supabase.from("post_comments").delete().eq("id", item.id);
  };

  return (
    <section className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl tracking-[0.16em]">Comentarios</h2>
        <span className="text-xs uppercase tracking-[0.3em] text-zinc-400">
          {comments.length} mensagens
        </span>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-4">
        <div className="max-h-80 overflow-y-auto pr-2">
          {loading ? (
            <p className="text-sm text-zinc-400">Carregando comentarios...</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-zinc-400">Nenhum comentario ainda.</p>
          ) : (
            <div className="grid gap-3">
              {comments.map((item) => (
                <article
                  key={item.id}
                  className={`rounded-2xl border px-3 py-3 ${
                    item.is_hidden
                      ? "border-red-400/30 bg-red-500/10"
                      : "border-white/10 bg-black/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-zinc-400">
                      <span className="text-zinc-200">
                        {item.display_name || "Piloto CRE"}
                      </span>
                      {item.username ? <span>@{item.username}</span> : null}
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                      {timeLabel(item.created_at)}
                    </span>
                  </div>

                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-zinc-200">
                    {item.is_hidden && !isAdmin
                      ? "Comentario ocultado pela moderacao."
                      : item.content}
                  </p>

                  {(isAdmin || userId === item.user_id) && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {isAdmin ? (
                        <button
                          type="button"
                          onClick={() => handleToggleHidden(item)}
                          className="rounded-full border border-white/20 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-zinc-200 transition hover:border-white/45"
                        >
                          {item.is_hidden ? "Reexibir" : "Ocultar"}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="rounded-full border border-red-400/40 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-red-200 transition hover:border-red-300/70"
                      >
                        Apagar
                      </button>
                    </div>
                  )}
                </article>
              ))}
              <div ref={endRef} />
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        {error ? <p className="text-xs text-red-300">{error}</p> : null}
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={3}
          placeholder={isBanned ? "Conta bloqueada para comentar" : "Escreva seu comentario"}
          disabled={isBanned}
          className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none disabled:opacity-50"
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || !text.trim() || isBanned}
            className="rounded-full border border-yellow-300/40 bg-yellow-300/10 px-5 py-2 text-xs uppercase tracking-[0.25em] text-yellow-100 transition hover:border-yellow-300 hover:bg-yellow-300/20 disabled:opacity-50"
          >
            {sending ? "Enviando" : "Comentar"}
          </button>
        </div>
      </div>
    </section>
  );
}

