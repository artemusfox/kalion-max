"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { useToast } from "@/components/Toast";
import { useLanguage } from "@/components/LanguageProvider";
import { isPro, isTrial, trialDaysLeft, type ProfileSubscription } from "@/lib/premium";
import PaywallModal from "@/components/PaywallModal";

export default function SubscriptionCard() {
  const { lang } = useLanguage();
  const { toast } = useToast();
  const [profile, setProfile] = useState<(ProfileSubscription & { ls_customer_id?: string | null }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from("profiles")
        .select("subscription_tier, subscription_status, subscription_period_end, trial_ends_at, ls_customer_id, is_admin, is_pro_granted")
        .single();
      setProfile(data as any);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div style={{ padding: 30, textAlign: "center" }}><div className="spinner" style={{ margin: "0 auto" }} /></div>;
  }

  const pro = isPro(profile);
  const trial = isTrial(profile);
  const trialDays = trialDaysLeft(profile);
  const adminPro = !!(profile as any)?.is_admin;
  const grantedPro = !!(profile as any)?.is_pro_granted;

  function openPortal() {
    if (!profile?.ls_customer_id) {
      toast(lang === "en" ? "Customer portal unavailable" : "Kundenportal nicht verfügbar", { type: "error" });
      return;
    }
    window.open(`https://app.lemonsqueezy.com/billing/${profile.ls_customer_id}`, "_blank", "noopener");
  }

  // FREE
  if (!pro) {
    return (
      <div>
        <div style={{
          padding: 16, background: "var(--bg-elevated)",
          border: "1px solid var(--border)", borderRadius: 10,
          marginBottom: 12, display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{ fontSize: 28 }}>🆓</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 800 }}>
              {lang === "en" ? "Free Plan" : "Free-Plan"}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>
              {lang === "en"
                ? "Limits: 3 plans · 5 photos · 30-day history"
                : "Limits: 3 Pläne · 5 Fotos · 30 Tage Historie"}
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowPaywall(true)}
          className="btn btn-primary btn-block"
          style={{ padding: 14 }}
        >
          💎 {lang === "en" ? "Upgrade to Pro" : "Auf Pro upgraden"}
        </button>
        <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} />
      </div>
    );
  }

  // PRO (active or trial)
  const periodEnd = profile?.subscription_period_end
    ? new Date(profile.subscription_period_end).toLocaleDateString(lang === "en" ? "en-US" : "de-DE")
    : null;

  const statusLabel: Record<string, { de: string; en: string; color: string }> = {
    active:    { de: "Aktiv", en: "Active",     color: "var(--green)" },
    trialing:  { de: "Testphase", en: "Trial",  color: "var(--accent)" },
    cancelled: { de: "Gekündigt — läuft aus", en: "Cancelled — ends soon", color: "var(--amber)" },
    past_due:  { de: "Zahlung fehlgeschlagen", en: "Payment failed", color: "var(--red)" },
  };
  const status = profile?.subscription_status || "active";
  const sl = statusLabel[status] || statusLabel.active;

  return (
    <div>
      <div style={{
        padding: 16,
        background: "linear-gradient(135deg, var(--accent-tint), transparent)",
        border: "1px solid var(--accent-border)", borderRadius: 10,
        marginBottom: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div style={{ fontSize: 28 }}>{adminPro ? "🛡️" : grantedPro ? "🎁" : "💎"}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--accent)" }}>
              KALION MAX Pro
            </div>
            <div style={{ fontSize: 10, fontWeight: 800, color: sl.color, letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>
              ● {adminPro
                  ? (lang === "en" ? "Admin (all features)" : "Admin (alle Features)")
                  : grantedPro
                  ? (lang === "en" ? "Granted by admin" : "Manuell freigeschaltet")
                  : (lang === "en" ? sl.en : sl.de)}
            </div>
          </div>
        </div>

        {!adminPro && !grantedPro && trial && trialDays !== null && (
          <div style={{
            padding: "8px 12px", background: "var(--accent-tint)",
            border: "1px solid var(--accent-border)", borderRadius: 8,
            fontSize: 12, fontWeight: 700, marginBottom: 8,
          }}>
            🎁 {lang === "en"
              ? `${trialDays} day${trialDays === 1 ? "" : "s"} left of free trial`
              : `Noch ${trialDays} Tag${trialDays === 1 ? "" : "e"} Testphase`}
          </div>
        )}

        {!adminPro && !grantedPro && periodEnd && (
          <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
            {status === "cancelled"
              ? (lang === "en" ? `Access until: ${periodEnd}` : `Zugang bis: ${periodEnd}`)
              : (lang === "en" ? `Renews: ${periodEnd}` : `Verlängert sich: ${periodEnd}`)}
          </div>
        )}
      </div>

      {!adminPro && !grantedPro && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
            <button onClick={openPortal} className="btn btn-block" disabled={!profile?.ls_customer_id}>
              {lang === "en" ? "🧾 Manage subscription" : "🧾 Abo verwalten"}
            </button>
          </div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 10, textAlign: "center", lineHeight: 1.5 }}>
            {lang === "en"
              ? "Cancel, update payment method, view invoices — all in the customer portal"
              : "Kündigen, Zahlungsmethode ändern, Rechnungen ansehen — alles im Kundenportal"}
          </div>
        </>
      )}
    </div>
  );
}
