// ═══════════════════════════════════════════════════════════
// Premium / Subscription Helper
// Liest profile.subscription_* und entscheidet ob Pro-Features verfügbar sind.
// ═══════════════════════════════════════════════════════════

export type SubscriptionTier = "free" | "pro";
export type SubscriptionStatus =
  | "inactive" | "active" | "trialing" | "cancelled" | "expired" | "past_due";

export type ProfileSubscription = {
  subscription_tier?: SubscriptionTier | null;
  subscription_status?: SubscriptionStatus | null;
  subscription_period_end?: string | null;
  trial_ends_at?: string | null;
  // Admin- und Grant-Felder: lassen Pro-Status auch ohne echte Subscription wahr sein
  is_admin?: boolean | null;
  is_pro_granted?: boolean | null;
};

// Hauptfunktion: Hat der User aktive Pro-Features?
// Drei Wege zu Pro: (1) echte Subscription, (2) Admin-Grant, (3) ist selbst Admin
export function isPro(profile: ProfileSubscription | null | undefined): boolean {
  if (!profile) return false;
  // Admins kriegen Pro automatisch — die App-Owner sollen alles testen können
  if (profile.is_admin) return true;
  // Admin hat manuell Pro freigeschaltet (kostenfreier Grant)
  if (profile.is_pro_granted) return true;
  // Echte Subscription
  if (profile.subscription_tier !== "pro") return false;
  const status = profile.subscription_status;
  if (status === "active" || status === "trialing") return true;
  // Cancelled aber Periode noch nicht abgelaufen → bis zum Ende noch Pro
  if (status === "cancelled" && profile.subscription_period_end) {
    return new Date(profile.subscription_period_end) > new Date();
  }
  return false;
}

// Sind sie noch im Trial?
export function isTrial(profile: ProfileSubscription | null | undefined): boolean {
  if (!profile) return false;
  return profile.subscription_status === "trialing";
}

// Wieviele Tage hat der Trial noch?
export function trialDaysLeft(profile: ProfileSubscription | null | undefined): number | null {
  if (!profile?.trial_ends_at) return null;
  const ms = new Date(profile.trial_ends_at).getTime() - Date.now();
  if (ms <= 0) return 0;
  return Math.ceil(ms / 86400_000);
}

// Lockt der Subscription-Status den User raus aus Pro? (z.B. past_due)
export function needsAttention(profile: ProfileSubscription | null | undefined): boolean {
  if (!profile) return false;
  return profile.subscription_status === "past_due"
      || profile.subscription_status === "cancelled";
}

// FREE-Tier-Limits — werden in Code-Stellen abgefragt
export const FREE_LIMITS = {
  maxPlans: 3,
  maxPhotos: 5,
  workoutHistoryDays: 30,
  customAccent: false,
  mediumThemes: false,
  lightThemes: false,
  customAvatar: false,
  watermarkFreeShare: false,
  aiCoach: false,
  pdfExport: false,
  healthSync: false,
  analytics: "basic" as "basic" | "full",
};

// Helper: Kann der User dieses Feature nutzen?
export function canUseFeature(
  profile: ProfileSubscription | null | undefined,
  feature: keyof typeof FREE_LIMITS
): boolean {
  if (isPro(profile)) return true;
  const v = FREE_LIMITS[feature];
  // Boolean → "false" heißt: gesperrt für Free
  if (typeof v === "boolean") return v;
  // Sonst (Number/String) ist es ein Limit-Wert, nicht ein Allow/Deny
  return false;
}

// Beispielsweise: kann der User noch einen Plan erstellen?
export function canAddMorePlans(
  profile: ProfileSubscription | null | undefined,
  currentCount: number
): boolean {
  if (isPro(profile)) return true;
  return currentCount < FREE_LIMITS.maxPlans;
}

export function canAddMorePhotos(
  profile: ProfileSubscription | null | undefined,
  currentCount: number
): boolean {
  if (isPro(profile)) return true;
  return currentCount < FREE_LIMITS.maxPhotos;
}
