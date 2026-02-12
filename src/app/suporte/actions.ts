"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const VALID_STATUS = new Set(["aberto", "em_analise", "resolvido"]);

export async function createSupportTicket(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    redirect("/login");
  }

  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const priority = String(formData.get("priority") ?? "").trim();
  const contactEmail = String(formData.get("contact_email") ?? "").trim();
  const contactDiscord = String(formData.get("contact_discord") ?? "").trim();

  if (!subject || !message || !category || !priority) {
    redirect("/suporte?error=Preencha+todos+os+campos+obrigatorios");
  }

  const { error } = await supabase.from("support_tickets").insert({
    user_id: user.id,
    subject,
    message,
    category,
    priority,
    status: "aberto",
    contact_email: contactEmail || user.email || null,
    contact_discord: contactDiscord || null,
  });

  if (error) {
    redirect(`/suporte?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/suporte?success=Chamado+enviado+com+sucesso");
}

export async function updateSupportTicketStatus(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    redirect("/login");
  }

  const ticketId = String(formData.get("ticket_id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();

  if (!ticketId || !VALID_STATUS.has(status)) {
    redirect("/suporte?error=Atualizacao+invalida");
  }

  const { data: me } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!me?.is_admin) {
    redirect("/suporte?error=Sem+permissao+para+moderar");
  }

  const { error } = await supabase
    .from("support_tickets")
    .update({
      status,
      resolved_at: status === "resolvido" ? new Date().toISOString() : null,
      resolved_by: status === "resolvido" ? user.id : null,
    })
    .eq("id", ticketId);

  if (error) {
    redirect(`/suporte?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/suporte?success=Status+atualizado");
}

export async function deleteSupportTicket(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    redirect("/login");
  }

  const ticketId = String(formData.get("ticket_id") ?? "").trim();
  if (!ticketId) {
    redirect("/suporte?error=Chamado+invalido");
  }

  const { data: me } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  const query = supabase.from("support_tickets").delete().eq("id", ticketId);
  const { error } = me?.is_admin
    ? await query
    : await query.eq("user_id", user.id);

  if (error) {
    redirect(`/suporte?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/suporte?success=Chamado+removido");
}
