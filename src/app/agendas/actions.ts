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
    redirect("/agendas?error=Sem+permissao");
  }

  return { supabase, userId: userData.user.id };
}

async function requireLogged() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login");
  }

  return { supabase, userId: userData.user.id };
}

function toIso(value: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function parseMaxSlots(value: FormDataEntryValue | null) {
  const parsed = Number(String(value ?? "").trim());
  if (!Number.isFinite(parsed) || parsed < 1) return 20;
  return Math.floor(parsed);
}

export async function createEvent(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const startAt = String(formData.get("start_at") ?? "").trim();
  const endAt = String(formData.get("end_at") ?? "").trim();
  const track = String(formData.get("track") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const link = String(formData.get("link") ?? "").trim();
  const maxSlots = parseMaxSlots(formData.get("max_slots"));

  if (!title || !startAt) {
    redirect("/agendas?error=Titulo+e+data+obrigatorios");
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
    max_slots: maxSlots,
    created_by: userId,
  });

  if (error) {
    redirect(`/agendas?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/agendas?success=Evento+criado");
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
  const maxSlots = parseMaxSlots(formData.get("max_slots"));

  if (!id || !title || !startAt) {
    redirect("/agendas?error=Dados+invalidos");
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
      max_slots: maxSlots,
    })
    .eq("id", id);

  if (error) {
    redirect(`/agendas?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/agendas?success=Evento+atualizado");
}

export async function deleteEvent(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    redirect("/agendas?error=Evento+nao+encontrado");
  }

  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("agenda_events").delete().eq("id", id);

  if (error) {
    redirect(`/agendas?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/agendas?success=Evento+removido");
}

export async function registerEvent(formData: FormData) {
  const eventId = String(formData.get("event_id") ?? "").trim();
  if (!eventId) {
    redirect("/agendas?error=Evento+invalido");
  }

  const { supabase, userId } = await requireLogged();

  const { data: event } = await supabase
    .from("agenda_events")
    .select("id,max_slots")
    .eq("id", eventId)
    .maybeSingle();

  if (!event) {
    redirect("/agendas?error=Evento+nao+encontrado");
  }

  const { count } = await supabase
    .from("agenda_event_registrations")
    .select("id", { count: "exact", head: true })
    .eq("event_id", eventId);

  if ((count ?? 0) >= event.max_slots) {
    redirect("/agendas?error=Vagas+esgotadas");
  }

  const { error } = await supabase.from("agenda_event_registrations").insert({
    event_id: eventId,
    user_id: userId,
  });

  if (error) {
    if (error.code === "23505") {
      redirect("/agendas?success=Voce+ja+esta+inscrito");
    }
    redirect(`/agendas?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/agendas?success=Inscricao+confirmada");
}

export async function unregisterEvent(formData: FormData) {
  const eventId = String(formData.get("event_id") ?? "").trim();
  if (!eventId) {
    redirect("/agendas?error=Evento+invalido");
  }

  const { supabase, userId } = await requireLogged();
  const { error } = await supabase
    .from("agenda_event_registrations")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", userId);

  if (error) {
    redirect(`/agendas?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/agendas?success=Inscricao+cancelada");
}
