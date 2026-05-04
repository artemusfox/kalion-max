import { createClient } from "@/lib/supabase-server";
import { NextResponse, type NextRequest } from "next/server";

// OAuth-Callback: Provider redirected hier hin mit `code`,
// wir tauschen ihn gegen eine Session und schicken den User weiter.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const failUrl = new URL("/auth/login", url.origin);
      failUrl.search = `?error=${encodeURIComponent(error.message)}`;
      return NextResponse.redirect(failUrl);
    }
  }

  const redirectUrl = new URL(next, url.origin);
  return NextResponse.redirect(redirectUrl);
}
