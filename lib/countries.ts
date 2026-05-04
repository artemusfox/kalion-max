// ═══════════════════════════════════════════════════════════
// Länder-Helfer — Flag-Emoji aus ISO-Code, Name via Intl.DisplayNames
// Keine fest verdrahtete Liste, alles via Browser-Standards.
// ═══════════════════════════════════════════════════════════

// Erzeugt aus "DE" → "🇩🇪" (Regional-Indicator-Symbols)
export function flagEmoji(code: string): string {
  if (!code || code.length !== 2) return "🏳️";
  const upper = code.toUpperCase();
  // Nur ASCII-Buchstaben verarbeiten
  if (!/^[A-Z]{2}$/.test(upper)) return "🏳️";
  const A = 0x1F1E6;
  const codePoints = [
    A + (upper.charCodeAt(0) - 65),
    A + (upper.charCodeAt(1) - 65),
  ];
  return String.fromCodePoint(...codePoints);
}

// ISO-Code → lokalisierter Name (server- & client-side, via Intl)
export function countryName(code: string, locale: string = "en"): string {
  if (!code || code.length !== 2) return code;
  try {
    const dn = new Intl.DisplayNames([locale], { type: "region" });
    return dn.of(code.toUpperCase()) || code;
  } catch {
    return code;
  }
}

// Server-side Helper: simple Wrapper, der bei fehlendem Intl-Support fallback macht
export const COUNTRY_NAMES: Record<string, string> = new Proxy({} as Record<string, string>, {
  get(_target, prop: string) {
    if (typeof prop !== "string" || prop.length !== 2) return prop;
    return countryName(prop, "en");
  },
});
