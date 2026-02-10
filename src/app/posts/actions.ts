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
    redirect("/posts?error=Sem%20permissao");
  }

  return { supabase, userId: userData.user.id };
}

export async function createPost(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const tag = String(formData.get("tag") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const readTime = String(formData.get("read_time") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const coverUrl = String(formData.get("cover_url") ?? "").trim();

  if (!title || !excerpt || !tag) {
    redirect("/posts?error=Preencha%20titulo%2C%20resumo%20e%20tag");
  }

  const { supabase, userId } = await requireAdmin();
  const { error } = await supabase.from("posts").insert({
    title,
    excerpt,
    tag,
    author: author || "Equipe CRE",
    read_time: readTime || null,
    publish_date: date || null,
    cover_url: coverUrl || null,
    created_by: userId,
  });

  if (error) {
    redirect(`/posts?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/posts?success=Post%20criado");
}

export async function updatePost(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const tag = String(formData.get("tag") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const readTime = String(formData.get("read_time") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const coverUrl = String(formData.get("cover_url") ?? "").trim();

  if (!id || !title || !excerpt || !tag) {
    redirect("/posts?error=Dados%20invalidos");
  }

  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("posts")
    .update({
      title,
      excerpt,
      tag,
      author: author || "Equipe CRE",
      read_time: readTime || null,
      publish_date: date || null,
      cover_url: coverUrl || null,
    })
    .eq("id", id);

  if (error) {
    redirect(`/posts?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/posts?success=Post%20atualizado");
}

export async function deletePost(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    redirect("/posts?error=Post%20nao%20encontrado");
  }

  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("posts").delete().eq("id", id);

  if (error) {
    redirect(`/posts?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/posts?success=Post%20removido");
}
