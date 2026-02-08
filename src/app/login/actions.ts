"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isValidEmail } from "@/lib/auth/validation";
import { ensureUsername } from "@/lib/auth/username";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!isValidEmail(email)) {
    redirect("/login?error=E-mail%20inválido");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
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
