import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ensureUsername } from "@/lib/auth/username";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.clone();
  const response = NextResponse.redirect(url);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  await supabase.auth.exchangeCodeForSession(request.url);

  const { data: userData } = await supabase.auth.getUser();
  if (userData.user) {
    const username = await ensureUsername(
      userData.user.id,
      userData.user.email,
    );
    url.pathname = `/pilotos/${username}`;
    return NextResponse.redirect(url);
  }

  url.pathname = "/dashboard";
  return NextResponse.redirect(url);
}
