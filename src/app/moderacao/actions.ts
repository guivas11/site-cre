"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    redirect("/");
  }

  return { supabase, adminId: userData.user.id };
}

export async function togglePostHidden(formData: FormData) {
  const postId = String(formData.get("post_id") ?? "").trim();
  const nextHidden = String(formData.get("next_hidden") ?? "") === "true";

  if (!postId) redirect("/moderacao?error=Post+invalido");

  const { supabase, adminId } = await requireAdmin();
  const { error } = await supabase
    .from("posts")
    .update({
      is_hidden: nextHidden,
      moderated_by: adminId,
      moderated_at: new Date().toISOString(),
      hidden_reason: nextHidden ? "Moderado manualmente" : null,
    })
    .eq("id", postId);

  if (error) {
    redirect(`/moderacao?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/moderacao?success=Post+atualizado");
}

export async function toggleCommentHidden(formData: FormData) {
  const commentId = String(formData.get("comment_id") ?? "").trim();
  const nextHidden = String(formData.get("next_hidden") ?? "") === "true";

  if (!commentId) redirect("/moderacao?error=Comentario+invalido");

  const { supabase, adminId } = await requireAdmin();
  const { error } = await supabase
    .from("post_comments")
    .update({
      is_hidden: nextHidden,
      moderated_by: adminId,
      moderated_at: new Date().toISOString(),
      hidden_reason: nextHidden ? "Moderado manualmente" : null,
    })
    .eq("id", commentId);

  if (error) {
    redirect(`/moderacao?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/moderacao?success=Comentario+atualizado");
}

export async function setUserBan(formData: FormData) {
  const userId = String(formData.get("user_id") ?? "").trim();
  const nextBan = String(formData.get("next_ban") ?? "") === "true";
  const reason = String(formData.get("reason") ?? "").trim();

  if (!userId) redirect("/moderacao?error=Usuario+invalido");

  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("profiles")
    .update({
      is_banned: nextBan,
      ban_reason: nextBan ? reason || "Violacao de conduta" : null,
      banned_at: nextBan ? new Date().toISOString() : null,
    })
    .eq("id", userId);

  if (error) {
    redirect(`/moderacao?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/moderacao?success=Usuario+atualizado");
}
