// ═══════════════════════════════════════
// Hilfsfunktionen zur Fehlerübersetzung
// ═══════════════════════════════════════

const AUTH_ERROR_MAP: Record<string, string> = {
  "Invalid login credentials": "E-Mail oder Passwort falsch.",
  "Email not confirmed": "Bitte bestätige zuerst deine E-Mail-Adresse.",
  "User already registered": "Diese E-Mail ist bereits registriert.",
  "Password should be at least 6 characters": "Passwort muss mindestens 6 Zeichen haben.",
  "Unable to validate email address: invalid format": "Bitte gib eine gültige E-Mail-Adresse ein.",
  "Email rate limit exceeded": "Zu viele Anfragen. Bitte warte kurz.",
  "For security purposes, you can only request this once every 60 seconds": "Bitte warte eine Minute, bevor du es erneut versuchst.",
  "Signups not allowed for this instance": "Registrierung ist derzeit deaktiviert.",
  "New password should be different from the old password": "Das neue Passwort muss sich vom alten unterscheiden.",
};

export function translateAuthError(msg: string): string {
  if (AUTH_ERROR_MAP[msg]) return AUTH_ERROR_MAP[msg];
  for (const [en, de] of Object.entries(AUTH_ERROR_MAP)) {
    if (msg.toLowerCase().includes(en.toLowerCase())) return de;
  }
  return msg;
}
