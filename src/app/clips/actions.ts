import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createClip(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const clipUrl = String(formData.get("clip_url") ?? "").trim();
  const youtubeUrl = String(formData.get("youtube_url") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const track = String(formData.get("track") ?? "").trim();
  const lapTime = String(formData.get("lap_time") ?? "").trim();

  if (!title || (!clipUrl && !youtubeUrl)) {
    redirect("/clips?error=Preencha+o+titulo+e+um+video");
  }

  const { error } = await supabase.from("race_clips").insert({
    user_id: user.id,
    title,
    description: description || null,
    clip_url: clipUrl || null,
    youtube_url: youtubeUrl || null,
    category: category || null,
    track: track || null,
    lap_time: lapTime || null,
  });

  if (error) {
    redirect(`/clips?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/clips?success=Clip+publicado");
}



export async function deleteClip(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const clipId = String(formData.get("clip_id") ?? "").trim();
  if (!clipId) {
    redirect("/clips?error=Clip+invalido");
  }

  const { error } = await supabase
    .from("race_clips")
    .delete()
    .eq("id", clipId)
    .eq("user_id", user.id);

  if (error) {
    redirect("/clips?error=" + encodeURIComponent(error.message));
  }

  redirect("/clips?success=Clip+apagado");
}
