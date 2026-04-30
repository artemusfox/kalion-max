// ═══════════════════════════════════════════════════════════
// Recovery-Codes für 2FA — Generation + Format
// ═══════════════════════════════════════════════════════════

const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"; // ohne i, l, o, 0, 1 (lesbarer)

function randomChar(): string {
  const buf = new Uint8Array(1);
  crypto.getRandomValues(buf);
  return ALPHABET[buf[0] % ALPHABET.length];
}

export function generateRecoveryCode(): string {
  const a = Array.from({ length: 5 }, randomChar).join("");
  const b = Array.from({ length: 5 }, randomChar).join("");
  return `${a}-${b}`;
}

export function generateRecoveryCodeBatch(count = 8): string[] {
  return Array.from({ length: count }, generateRecoveryCode);
}

// Plain-Text aus User-Eingabe normalisieren (Whitespace + Case)
export function normalizeCode(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, "");
}
