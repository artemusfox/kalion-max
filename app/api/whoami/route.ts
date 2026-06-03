import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { isPro } from "@/lib/premium";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "not logged in", authErr }, { status: 401 });

  const { data: profile, error: profErr } = await supabase
    .from("profiles").select("*").eq("id", user.id).single();

  return NextResponse.json({
    auth: { id: user.id, email: user.email },
    profile_loaded: !!profile,
    profile_error: profErr?.message,
    profile_fields: profile ? {
      is_admin: profile.is_admin,
      is_pro_granted: profile.is_pro_granted,
      subscription_tier: profile.subscription_tier,
      subscription_status: profile.subscription_status,
    } : null,
    isPro_result: isPro(profile),
  });
}
