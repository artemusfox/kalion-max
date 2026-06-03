// Debug-Endpoint: zeigt was die App für den eingeloggten User sieht
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { isPro } from "@/lib/premium";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "not logged in", authErr }, { status: 401 });
  }

  const { data: profile, error: profErr } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const proResult = isPro(profile);

  return NextResponse.json({
    auth: { id: user.id, email: user.email },
    profile_loaded: !!profile,
    profile_error: profErr?.message,
    profile_fields: profile ? {
      display_name: profile.display_name,
      is_admin: profile.is_admin,
      is_pro_granted: profile.is_pro_granted,
      is_moderator: profile.is_moderator,
      is_beta: profile.is_beta,
      subscription_tier: profile.subscription_tier,
      subscription_status: profile.subscription_status,
      subscription_period_end: profile.subscription_period_end,
      trial_ends_at: profile.trial_ends_at,
    } : null,
    isPro_result: proResult,
    decision_reasons: profile ? {
      admin_check: !!profile.is_admin,
      granted_check: !!profile.is_pro_granted,
      sub_tier_pro: profile.subscription_tier === "pro",
      sub_status_active: profile.subscription_status === "active" || profile.subscription_status === "trialing",
    } : null,
  }, { headers: { "Cache-Control": "no-store" } });
}
