"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isStrongPassword, isValidEmail } from "@/lib/auth/validation";
import { ensureUsername } from "@/lib/auth/username";
import { getSiteUrl } from "@/lib/site-url";

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!isValidEmail(email)) {
    redirect("/signup?error=E-mail%20invalido");
  }

  if (!isStrongPassword(password)) {
    redirect(
      "/signup?error=Senha%20fraca%20(use%208%2B%20caracteres%2C%20maiuscula%2C%20minuscula%2C%20numero%20e%20simbolo)",
    );
  }

  const supabase = await createClient();
  const origin = await getSiteUrl();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  const user = data.user;
  const session = data.session;

  const username = user ? await ensureUsername(user.id, user.email) : null;

  if (username && session) {
    redirect(`/pilotos/${username}`);
  }

  redirect(`/signup/verify?email=${encodeURIComponent(email)}`);
}
