"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createSetup(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    redirect("/login");
  }

  const title = String(formData.get("title") ?? "").trim();
  const track = String(formData.get("track") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const carName = String(formData.get("car_name") ?? "").trim();
  const setupVersion = String(formData.get("setup_version") ?? "").trim();
  const lapTime = String(formData.get("lap_time") ?? "").trim();
  const setupNotes = String(formData.get("setup_notes") ?? "").trim();

  if (!title || !track || !setupNotes) {
    redirect("/setups?error=Preencha+titulo%2C+pista+e+setup");
  }

  const { error } = await supabase.from("track_setups").insert({
    user_id: user.id,
    title,
    track,
    category: category || null,
    car_name: carName || null,
    setup_version: setupVersion || null,
    lap_time: lapTime || null,
    setup_notes: setupNotes,
  });

  if (error) {
    redirect(`/setups?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/setups?success=Setup+publicado");
}

export async function deleteSetup(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    redirect("/login");
  }

  const setupId = String(formData.get("setup_id") ?? "").trim();
  if (!setupId) {
    redirect("/setups?error=Setup+invalido");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  const query = supabase.from("track_setups").delete().eq("id", setupId);
  const { error } = profile?.is_admin
    ? await query
    : await query.eq("user_id", user.id);

  if (error) {
    redirect(`/setups?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/setups?success=Setup+removido");
}



