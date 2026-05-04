import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyWebhookSignature } from "@/lib/lemonsqueezy";

// Service-Role-Client umgeht RLS — nötig damit Webhook fremde User-Profile updaten kann
function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// Mappe LS-Status auf unsere Statuswerte
function mapStatus(s: string): string {
  // LS-Status: on_trial, active, past_due, paused, expired, cancelled, unpaid
  if (s === "on_trial") return "trialing";
  if (s === "active") return "active";
  if (s === "past_due" || s === "unpaid") return "past_due";
  if (s === "cancelled" || s === "paused") return "cancelled";
  if (s === "expired") return "expired";
  return "inactive";
}

export async function POST(request: NextRequest) {
  // RAW Body holen für Signatur-Check
  const raw = await request.text();
  const signature = request.headers.get("x-signature") || "";

  if (!verifyWebhookSignature(raw, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: any;
  try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: "Bad JSON" }, { status: 400 }); }

  const eventType = body?.meta?.event_name as string | undefined;
  const customData = body?.meta?.custom_data || {};
  const userId: string | undefined = customData?.user_id;
  const data = body?.data?.attributes || {};
  const subId = body?.data?.id;

  // Audit immer schreiben (auch wenn user_id fehlt)
  const supabase = adminClient();
  await supabase.from("subscription_events").insert({
    user_id: userId || null,
    provider: "lemonsqueezy",
    event_type: eventType || "unknown",
    subscription_id: subId,
    payload: body,
  });

  if (!userId) {
    // Kein User-Ref → können wir nichts updaten, aber log ist da
    return NextResponse.json({ ok: true, warning: "no user_id in custom_data" });
  }

  // Subscription-relevante Events
  const subEvents = new Set([
    "subscription_created",
    "subscription_updated",
    "subscription_resumed",
    "subscription_cancelled",
    "subscription_expired",
    "subscription_paused",
    "subscription_unpaused",
  ]);

  if (subEvents.has(eventType || "")) {
    const updates: any = {
      subscription_id: subId,
      subscription_status: mapStatus(data.status || "active"),
      subscription_tier: "pro",
      subscription_period_end: data.renews_at || data.ends_at || null,
      ls_customer_id: String(data.customer_id || ""),
    };

    // Trial-Ende setzen falls vorhanden
    if (data.trial_ends_at) updates.trial_ends_at = data.trial_ends_at;

    // Wenn expired/cancelled & period vorbei → zurück auf free
    if ((eventType === "subscription_expired") ||
        (data.status === "expired")) {
      updates.subscription_tier = "free";
      updates.subscription_status = "expired";
    }

    await supabase.from("profiles").update(updates).eq("id", userId);
  }

  // Bei Zahlung erfolgreich → trotzdem nochmal active markieren (sicherheitshalber)
  if (eventType === "subscription_payment_success") {
    await supabase.from("profiles").update({
      subscription_status: "active",
      subscription_tier: "pro",
    }).eq("id", userId);
  }

  // Bei Zahlung fehlgeschlagen
  if (eventType === "subscription_payment_failed") {
    await supabase.from("profiles").update({
      subscription_status: "past_due",
    }).eq("id", userId);
  }

  return NextResponse.json({ ok: true });
}
