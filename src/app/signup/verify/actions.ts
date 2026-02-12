"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isValidEmail } from "@/lib/auth/validation";
import { getSiteUrl } from "@/lib/site-url";

export async function resendVerificationEmail(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();

  if (!isValidEmail(email)) {
    redirect("/signup/verify?error=E-mail%20invalido");
  }

  const supabase = await createClient();
  const origin = await getSiteUrl();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    redirect(
      `/signup/verify?email=${encodeURIComponent(email)}&error=${encodeURIComponent(error.message)}`,
    );
  }

  redirect(
    `/signup/verify?email=${encodeURIComponent(email)}&success=Email%20reenviado%20com%20sucesso`,
  );
}
