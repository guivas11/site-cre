"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type PostLikeButtonProps = {
  postId: string;
  initialCount: number;
  initialLiked: boolean;
  userId?: string | null;
};

export default function PostLikeButton({
  postId,
  initialCount,
  initialLiked,
  userId,
}: PostLikeButtonProps) {
  const supabase = useMemo(() => createClient(), []);
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(initialLiked);
  const [loading, setLoading] = useState(false);

  const canLike = Boolean(userId);

  const handleToggle = async () => {
    if (!canLike || loading) return;
    setLoading(true);
    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((prev) => prev + (nextLiked ? 1 : -1));

    if (nextLiked) {
      const { error } = await supabase.from("post_likes").insert({
        post_id: postId,
        user_id: userId,
      });
      if (error) {
        setLiked(false);
        setCount((prev) => prev - 1);
      }
    } else {
      const { error } = await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId);
      if (error) {
        setLiked(true);
        setCount((prev) => prev + 1);
      }
    }

    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={!canLike || loading}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.3em] transition ${
        liked
          ? "border-yellow-300/60 bg-yellow-300/10 text-yellow-200"
          : "border-white/15 text-zinc-300 hover:border-white/40 hover:text-white"
      } ${!canLike ? "cursor-not-allowed opacity-50" : ""}`}
      aria-pressed={liked}
      title={canLike ? "Curtir post" : "Entre para curtir"}
    >
      <span className="text-xs">❤</span>
      {count}
    </button>
  );
}

