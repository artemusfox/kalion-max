// ═══════════════════════════════════════════════════════════
// VOICE — Sprachausgabe für den Workout-Timer
// Nutzt die Web Speech API (kostenlos, im Browser eingebaut).
// Toggle-Status pro Gerät in localStorage.
// ═══════════════════════════════════════════════════════════

const KEY = "kalion-voice";

export function isVoiceEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEY) === "1";
}

export function setVoiceEnabled(on: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, on ? "1" : "0");
}

export function isVoiceSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speak(text: string, lang: string = "de-DE") {
  if (!isVoiceSupported() || !isVoiceEnabled()) return;
  try {
    // Falls noch was läuft → abbrechen, neuer Cue hat Vorrang
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 1.05;   // einen Tick schneller, fühlt sich sportlich an
    u.pitch = 1.0;
    u.volume = 1.0;
    window.speechSynthesis.speak(u);
  } catch {
    // Stille Fehlerbehandlung — Sprache ist optional
  }
}

// Hilfsfunktion: einmal "anstoßen" beim ersten User-Klick
// (Browser blockieren Sprache sonst auf manchen Geräten bis zu einer User-Geste)
export function primeVoice() {
  if (!isVoiceSupported()) return;
  try {
    const u = new SpeechSynthesisUtterance("");
    u.volume = 0;
    window.speechSynthesis.speak(u);
  } catch {}
}
