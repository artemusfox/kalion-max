// ═══════════════════════════════════════════════════════════
// DSGVO-Cookie-Consent Helper
// ═══════════════════════════════════════════════════════════

export type ConsentValue = "all" | "necessary" | null;
const KEY = "kalion-consent";
const VERSION = "1";        // bei Änderungen der Consent-Politik bumpen → User wird neu gefragt
const VERSION_KEY = "kalion-consent-v";
const EVENT = "kalion-consent-changed";

export function readConsent(): ConsentValue {
  if (typeof window === "undefined") return null;
  // Wenn die Consent-Version geändert wurde, alten Wert verwerfen
  if (localStorage.getItem(VERSION_KEY) !== VERSION) return null;
  const v = localStorage.getItem(KEY);
  if (v === "all" || v === "necessary") return v;
  return null;
}

export function writeConsent(value: ConsentValue) {
  if (typeof window === "undefined") return;
  if (value === null) {
    localStorage.removeItem(KEY);
    localStorage.removeItem(VERSION_KEY);
  } else {
    localStorage.setItem(KEY, value);
    localStorage.setItem(VERSION_KEY, VERSION);
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: value }));
}

export function onConsentChange(handler: (v: ConsentValue) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const listener = () => handler(readConsent());
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}

// Trigger zum erneuten Aufruf des Consent-Dialogs (Footer-Link)
export function reopenConsentDialog() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("kalion-consent-reopen"));
}
