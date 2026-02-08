import { createClient } from "@/lib/supabase/server";

function normalizeUsername(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 20);
}

export async function ensureUsername(userId: string, email?: string | null) {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", userId)
    .maybeSingle();

  if (existing?.username) {
    return existing.username;
  }

  const base = normalizeUsername(email?.split("@")[0] || "piloto");
  let candidate = base || "piloto";
  let suffix = 1;

  while (true) {
    const { data: collision } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", candidate)
      .maybeSingle();

    if (!collision) {
      await supabase
        .from("profiles")
        .update({ username: candidate })
        .eq("id", userId);
      return candidate;
    }

    suffix += 1;
    candidate = `${base}_${suffix}`.slice(0, 20);
  }
}
