import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ensureUsername } from "@/lib/auth/username";

export async function POST(request: Request) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.headers
            .get("cookie")
            ?.split(";")
            .map((pair) => {
              const [name, ...rest] = pair.trim().split("=");
              return { name, value: rest.join("=") };
            })
            .filter((item) => item.name) ?? [];
        },
        setAll() {},
      },
    },
  );

  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const username = await ensureUsername(data.user.id, data.user.email);
  return NextResponse.json({ ok: true, username });
}
