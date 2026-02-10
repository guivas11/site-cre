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
    redirect("/agenda?error=Sem%20permissao");
  }

  return { supabase, userId: userData.user.id };
}

function toIso(value: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export async function createEvent(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const startAt = String(formData.get("start_at") ?? "").trim();
  const endAt = String(formData.get("end_at") ?? "").trim();
  const track = String(formData.get("track") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const link = String(formData.get("link") ?? "").trim();

  if (!title || !startAt) {
    redirect("/agenda?error=Titulo%20e%20data%20obrigatorios");
  }

  const { supabase, userId } = await requireAdmin();
  const { error } = await supabase.from("agenda_events").insert({
    title,
    start_at: toIso(startAt),
    end_at: endAt ? toIso(endAt) : null,
    track: track || null,
    category: category || null,
    description: description || null,
    link: link || null,
    created_by: userId,
  });

  if (error) {
    redirect(`/agenda?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/agenda?success=Evento%20criado");
}

export async function updateEvent(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const startAt = String(formData.get("start_at") ?? "").trim();
  const endAt = String(formData.get("end_at") ?? "").trim();
  const track = String(formData.get("track") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const link = String(formData.get("link") ?? "").trim();

  if (!id || !title || !startAt) {
    redirect("/agenda?error=Dados%20invalidos");
  }

  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("agenda_events")
    .update({
      title,
      start_at: toIso(startAt),
      end_at: endAt ? toIso(endAt) : null,
      track: track || null,
      category: category || null,
      description: description || null,
      link: link || null,
    })
    .eq("id", id);

  if (error) {
    redirect(`/agenda?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/agenda?success=Evento%20atualizado");
}

export async function deleteEvent(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    redirect("/agenda?error=Evento%20nao%20encontrado");
  }

  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("agenda_events").delete().eq("id", id);

  if (error) {
    redirect(`/agenda?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/agenda?success=Evento%20removido");
}
