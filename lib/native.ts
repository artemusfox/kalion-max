// ═══════════════════════════════════════════════════════════
// Native-Detection — erkennt ob die App in Capacitor läuft
// vs. im normalen Browser. Wichtig für Feature-Toggles
// (z.B. native Share-Sheet, native Haptics, native Storage).
// ═══════════════════════════════════════════════════════════

export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  // Capacitor injiziert ein globales `Capacitor`-Objekt
  return typeof (window as any).Capacitor !== "undefined";
}

export function nativePlatform(): "ios" | "android" | "web" {
  if (typeof window === "undefined") return "web";
  const cap = (window as any).Capacitor;
  if (!cap) return "web";
  return cap.getPlatform?.() || "web";
}

// Hilfsfunktion: Native Haptik wenn verfügbar, sonst nichts
export async function hapticImpact(style: "light" | "medium" | "heavy" = "light") {
  if (!isNativeApp()) {
    // Web fallback: Browser-Vibration
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(style === "heavy" ? 50 : style === "medium" ? 30 : 15);
    }
    return;
  }
  try {
    const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
    await Haptics.impact({
      style: style === "heavy" ? ImpactStyle.Heavy
           : style === "medium" ? ImpactStyle.Medium
           : ImpactStyle.Light,
    });
  } catch {
    // Plugin nicht installiert oder andere Fehler — silent
  }
}

// Hilfsfunktion: Native Status-Bar-Theming je nach Theme
export async function setStatusBarStyle(dark: boolean) {
  if (!isNativeApp()) return;
  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light });
  } catch {}
}
