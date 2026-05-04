// ═══════════════════════════════════════════════════════════
// Lemon Squeezy Integration
// Server-side helpers für Checkout-URLs und Webhook-Verifikation.
// ═══════════════════════════════════════════════════════════

import { createHmac, timingSafeEqual } from "node:crypto";

// Env-Vars die du in Vercel setzen musst:
// - LEMONSQUEEZY_API_KEY   (für API-Calls — optional, nur wenn wir API benutzen)
// - LEMONSQUEEZY_STORE_ID  (deine Store-ID)
// - LEMONSQUEEZY_VARIANT_MONTHLY  (Variant-ID des Monats-Abos)
// - LEMONSQUEEZY_VARIANT_YEARLY   (Variant-ID des Jahres-Abos)
// - LEMONSQUEEZY_WEBHOOK_SECRET   (Signing-Secret aus dem Webhook-Setup)

export const PLANS = {
  monthly: {
    id: "monthly",
    label: "Monatlich",
    labelEn: "Monthly",
    priceLabel: "€4,99 / Monat",
    priceLabelEn: "€4.99 / month",
    variantId: process.env.LEMONSQUEEZY_VARIANT_MONTHLY || "",
  },
  yearly: {
    id: "yearly",
    label: "Jährlich",
    labelEn: "Yearly",
    priceLabel: "€39 / Jahr",
    priceLabelEn: "€39 / year",
    badge: "−35% sparen",
    badgeEn: "Save 35%",
    variantId: process.env.LEMONSQUEEZY_VARIANT_YEARLY || "",
  },
} as const;

export type PlanId = keyof typeof PLANS;

// Erstellt eine Buy-URL — User klickt → landet auf checkout.lemonsqueezy.com
// Custom-Daten (user_id, email) werden mitgesendet, damit der Webhook später die Zuordnung machen kann.
export function buyUrl(opts: {
  variantId: string;
  userId: string;
  userEmail?: string | null;
  successRedirect?: string;
}): string {
  const params = new URLSearchParams();
  params.set("checkout[email]", opts.userEmail || "");
  params.set("checkout[custom][user_id]", opts.userId);
  if (opts.successRedirect) {
    params.set("checkout[success_url]", opts.successRedirect);
  }
  return `https://kalionmax.lemonsqueezy.com/checkout/buy/${opts.variantId}?${params.toString()}`;
  // Hinweis: 'kalionmax' muss durch den echten Store-Subdomain ersetzt werden,
  // den dir LS nach Store-Erstellung gibt. Notfalls als Env-Var konfigurieren.
}

// Customer-Portal-URL: User canceln + Karte updaten + Rechnungen ansehen
export function customerPortalUrl(customerId: string): string {
  return `https://app.lemonsqueezy.com/billing/${customerId}`;
}

// Webhook-Signatur verifizieren (LS schickt Header X-Signature mit HMAC-SHA256)
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const hmac = createHmac("sha256", secret);
  hmac.update(rawBody);
  const digest = hmac.digest("hex");
  try {
    return timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  } catch {
    return false;
  }
}
