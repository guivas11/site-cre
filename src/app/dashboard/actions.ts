"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const usernameRegex = /^[a-z0-9_]{3,20}$/;

export async function saveProfile(formData: FormData) {
  const displayName = String(formData.get("display_name") ?? "").trim();
  const username = String(formData.get("username") ?? "")
    .trim()
    .toLowerCase();
  const bio = String(formData.get("bio") ?? "").trim();
  const experience = String(formData.get("experience") ?? "").trim();
  const avatarUrl = String(formData.get("avatar_url") ?? "").trim();
  const bannerUrl = String(formData.get("banner_url") ?? "").trim();
  const favoriteTrack = String(formData.get("favorite_track") ?? "").trim();
  const favoriteTrackImage = String(
    formData.get("favorite_track_image") ?? "",
  ).trim();

  if (!displayName) {
    redirect("/dashboard?error=Nome%20obrigatório");
  }

  if (!usernameRegex.test(username)) {
    redirect(
      "/dashboard?error=Username%20inválido%20(use%203-20%20caracteres%20a-z%2C%200-9%20ou%20_)",
    );
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login");
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      id: userData.user.id,
      email: userData.user.email,
      display_name: displayName,
      username,
      bio,
      experience,
      avatar_url: avatarUrl || null,
      banner_url: bannerUrl || null,
      favorite_track: favoriteTrack || null,
      favorite_track_image: favoriteTrackImage || null,
    },
    { onConflict: "id" },
  );

  if (error) {
    const message =
      error.message.includes("profiles_username_key") ||
      error.message.toLowerCase().includes("duplicate key")
        ? "Esse username já está em uso. Escolha outro."
        : error.message;
    redirect(`/dashboard?error=${encodeURIComponent(message)}`);
  }

  redirect("/dashboard?success=Perfil%20atualizado");
}

export async function addVictory(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const track = String(formData.get("track") ?? "").trim();
  const position = String(formData.get("position") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!title) {
    redirect("/dashboard?error=Título%20obrigatório");
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login");
  }

  const { error } = await supabase.from("victories").insert({
    user_id: userData.user.id,
    title,
    track,
    position,
    category,
    date: date || null,
    notes,
  });

  if (error) {
    redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard?success=Vitória%20adicionada");
}

export async function deleteVictory(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("victories")
    .delete()
    .eq("id", id)
    .eq("user_id", userData.user.id);

  if (error) {
    redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard?success=Vitória%20removida");
}

export async function upsertLapTime(formData: FormData) {
  const track = String(formData.get("track") ?? "").trim();
  const time = String(formData.get("time") ?? "").trim();

  if (!track) {
    redirect("/dashboard?error=Pista%20obrigatória");
  }

  if (!/^\d+:\d{2}\.\d{3}$/.test(time)) {
    redirect(
      "/dashboard?error=Tempo%20inválido%20(use%20formato%201:23.456)",
    );
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login");
  }

  const { error } = await supabase.from("lap_times").upsert(
    {
      user_id: userData.user.id,
      track,
      time,
    },
    { onConflict: "user_id,track" },
  );

  if (error) {
    redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard?success=Tempo%20salvo");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
