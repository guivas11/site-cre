"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isValidEmail } from "@/lib/auth/validation";
import { ensureUsername } from "@/lib/auth/username";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!isValidEmail(email)) {
    redirect("/login?error=E-mail%20invalido");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const lower = error.message.toLowerCase();
    if (lower.includes("email not confirmed") || lower.includes("email_not_confirmed")) {
      redirect(`/signup/verify?email=${encodeURIComponent(email)}&error=Confirme%20seu%20e-mail%20antes%20de%20entrar`);
    }
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  const { data: userData } = await supabase.auth.getUser();
  const username = userData.user
    ? await ensureUsername(userData.user.id, userData.user.email)
    : null;

  if (username) {
    redirect(`/pilotos/${username}`);
  }

  redirect("/dashboard");
}
