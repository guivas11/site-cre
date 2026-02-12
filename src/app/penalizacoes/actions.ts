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
    redirect("/penalizacoes?error=Sem+permissao");
  }

  return { supabase, userId: userData.user.id };
}

export async function createPenalty(formData: FormData) {
  const pilotName = String(formData.get("pilot_name") ?? "").trim();
  const track = String(formData.get("track") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const penaltyType = String(formData.get("penalty_type") ?? "").trim();
  const happenedAt = String(formData.get("happened_at") ?? "").trim();
  const status = String(formData.get("status") ?? "ativo").trim() || "ativo";

  if (!pilotName || !reason || !penaltyType) {
    redirect("/penalizacoes?error=Preencha+piloto%2C+motivo+e+penalidade");
  }

  const { supabase, userId } = await requireAdmin();
  const { error } = await supabase.from("race_penalties").insert({
    pilot_name: pilotName,
    track: track || null,
    category: category || null,
    reason,
    penalty_type: penaltyType,
    status,
    happened_at: happenedAt || null,
    created_by: userId,
  });

  if (error) {
    redirect(`/penalizacoes?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/penalizacoes?success=Penalizacao+registrada");
}

export async function deletePenalty(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/penalizacoes?error=Penalizacao+invalida");

  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("race_penalties").delete().eq("id", id);

  if (error) {
    redirect(`/penalizacoes?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/penalizacoes?success=Penalizacao+removida");
}
