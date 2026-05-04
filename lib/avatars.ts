// ═══════════════════════════════════════════════════════════
// Avatar-System
// avatar_url-Feld in profiles speichert entweder:
//   - "preset:<id>" → Preset-Avatar (Emoji auf Gradient)
//   - https://...   → uploaded image
//   - null/empty    → Initial-Letter-Fallback
// ═══════════════════════════════════════════════════════════

export type AvatarPreset = {
  id: string;
  emoji: string;
  gradient: [string, string];
  label: string;
};

export const AVATAR_PRESETS: AvatarPreset[] = [
  // Strength
  { id: "strength_1", emoji: "🏋️", gradient: ["#FF5A6B", "#FF8B6B"], label: "Lifter" },
  { id: "strength_2", emoji: "💪", gradient: ["#FF5A6B", "#F472B6"], label: "Strong" },
  { id: "strength_3", emoji: "🥇", gradient: ["#FFB800", "#FF8B6B"], label: "Champion" },
  { id: "strength_4", emoji: "🏆", gradient: ["#FFB800", "#FFE066"], label: "Winner" },

  // Calisthenics
  { id: "calist_1",   emoji: "🤸", gradient: ["#2DD4BF", "#22D3EE"], label: "Acrobat" },
  { id: "calist_2",   emoji: "🧗", gradient: ["#2DD4BF", "#52D983"], label: "Climber" },
  { id: "calist_3",   emoji: "🤾", gradient: ["#52D983", "#22D3EE"], label: "Athlete" },

  // Cardio
  { id: "cardio_1",   emoji: "🏃", gradient: ["#60A5FA", "#22D3EE"], label: "Runner" },
  { id: "cardio_2",   emoji: "🚴", gradient: ["#60A5FA", "#7C8AFF"], label: "Cyclist" },
  { id: "cardio_3",   emoji: "🏊", gradient: ["#22D3EE", "#7C8AFF"], label: "Swimmer" },
  { id: "cardio_4",   emoji: "🚣", gradient: ["#7C8AFF", "#22D3EE"], label: "Rower" },

  // HIIT / Combat
  { id: "hiit_1",     emoji: "🔥", gradient: ["#FF5A6B", "#FFB800"], label: "Hot" },
  { id: "hiit_2",     emoji: "🥊", gradient: ["#FF5A6B", "#1f1f1f"], label: "Boxer" },
  { id: "hiit_3",     emoji: "🥋", gradient: ["#1f1f1f", "#FF5A6B"], label: "Fighter" },

  // Mobility / Mind
  { id: "mob_1",      emoji: "🧘", gradient: ["#A78BFA", "#F472B6"], label: "Yogi" },
  { id: "mob_2",      emoji: "🌿", gradient: ["#52D983", "#A78BFA"], label: "Zen" },
  { id: "mob_3",      emoji: "✨", gradient: ["#A78BFA", "#22D3EE"], label: "Aura" },

  // Mascots
  { id: "mascot_1",   emoji: "🦁", gradient: ["#FFB800", "#FF5A6B"], label: "Lion" },
  { id: "mascot_2",   emoji: "🐺", gradient: ["#9CA3AF", "#1f1f1f"], label: "Wolf" },
  { id: "mascot_3",   emoji: "🦅", gradient: ["#FFB800", "#1f1f1f"], label: "Eagle" },
];

export const PRESET_BY_ID: Record<string, AvatarPreset> =
  Object.fromEntries(AVATAR_PRESETS.map((a) => [a.id, a]));

export type AvatarKind = "preset" | "image" | "fallback";

export type ParsedAvatar =
  | { kind: "preset"; preset: AvatarPreset }
  | { kind: "image"; url: string }
  | { kind: "fallback"; initial: string };

export function parseAvatar(avatarUrl: string | null | undefined, displayName?: string | null): ParsedAvatar {
  if (avatarUrl?.startsWith("preset:")) {
    const id = avatarUrl.slice("preset:".length);
    const preset = PRESET_BY_ID[id];
    if (preset) return { kind: "preset", preset };
  }
  if (avatarUrl && /^https?:\/\//.test(avatarUrl)) {
    return { kind: "image", url: avatarUrl };
  }
  return { kind: "fallback", initial: (displayName || "?")[0].toUpperCase() };
}
