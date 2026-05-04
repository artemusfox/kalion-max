import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { PLANS, type PlanId } from "@/lib/lemonsqueezy";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const plan = body?.plan as PlanId;
  if (!plan || !(plan in PLANS)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const variantId = PLANS[plan].variantId;
  if (!variantId) {
    return NextResponse.json({
      error: "Lemon Squeezy not configured (missing variant ID)",
    }, { status: 500 });
  }

  // Store-Slug aus Env (z.B. 'kalionmax')
  const storeSlug = process.env.LEMONSQUEEZY_STORE_SLUG || "kalionmax";
  const origin = request.headers.get("origin") || new URL(request.url).origin;
  const successUrl = `${origin}/dashboard/settings?subscription=success`;

  const params = new URLSearchParams();
  params.set("checkout[email]", user.email || "");
  params.set("checkout[custom][user_id]", user.id);
  params.set("checkout[success_url]", successUrl);

  const url = `https://${storeSlug}.lemonsqueezy.com/checkout/buy/${variantId}?${params.toString()}`;
  return NextResponse.json({ url });
}
