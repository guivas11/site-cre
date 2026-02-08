"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isStrongPassword, isValidEmail } from "@/lib/auth/validation";
import { ensureUsername } from "@/lib/auth/username";

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!isValidEmail(email)) {
    redirect("/signup?error=E-mail%20inválido");
  }

  if (!isStrongPassword(password)) {
    redirect(
      "/signup?error=Senha%20fraca%20(use%208%2B%20caracteres%2C%20maiúscula%2C%20minúscula%2C%20número%20e%20símbolo)",
    );
  }

  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

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

  const username = user
    ? await ensureUsername(user.id, user.email)
    : null;

  if (username && session) {
    redirect(`/pilotos/${username}`);
  }

  redirect(`/signup/verify?email=${encodeURIComponent(email)}`);
}
