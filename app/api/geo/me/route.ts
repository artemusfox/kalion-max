import { createClient } from "@/lib/supabase-server";
import { NextResponse, type NextRequest } from "next/server";
import { COUNTRY_NAMES } from "@/lib/countries";

// Liest Vercel-Geo-Headers und schreibt sie ins User-Profil — wenn noch nicht gesetzt.
// Wird einmalig beim ersten Login client-seitig gefeuert.
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Vercel-Edge-Headers (kostenlos, immer mitgeliefert)
  // Doku: https://vercel.com/docs/edge-network/headers/request-headers#x-vercel-ip-country
  const country = request.headers.get("x-vercel-ip-country") || "";
  const region  = request.headers.get("x-vercel-ip-country-region") || "";
  const city    = decodeURIComponent(request.headers.get("x-vercel-ip-city") || "");
  const country_name = country ? (COUNTRY_NAMES[country.toUpperCase()] || country) : "";

  if (!country) {
    // Lokal beim Dev-Server gibt's keine Vercel-Header → einfach skippen
    return NextResponse.json({ ok: true, skipped: true });
  }

  const { error } = await supabase.rpc("set_user_geo", {
    p_country: country.toUpperCase(),
    p_country_name: country_name,
    p_city: city,
    p_region: region,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, country: country.toUpperCase() });
}
