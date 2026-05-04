// ═══════════════════════════════════════════════════════════
// Avatar-Storage-Cleanup
// Wenn ein User seinen Avatar ändert, müssen wir den alten Storage-File löschen.
// ═══════════════════════════════════════════════════════════

import type { SupabaseClient } from "@supabase/supabase-js";

// Aus einer Public-URL den Storage-Path extrahieren
// URL: https://{project}.supabase.co/storage/v1/object/public/avatars/{user_id}/avatar-123.jpg
// Path: {user_id}/avatar-123.jpg
export function extractStoragePath(publicUrl: string): string | null {
  if (!publicUrl) return null;
  const match = publicUrl.match(/\/object\/public\/avatars\/(.+?)(\?|$)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function deleteOldAvatar(supabase: SupabaseClient, oldUrl: string | null | undefined) {
  if (!oldUrl || !oldUrl.startsWith("http")) return;
  const path = extractStoragePath(oldUrl);
  if (!path) return;
  try {
    await supabase.storage.from("avatars").remove([path]);
  } catch {
    // Silent — wenn der File nicht existiert oder Permission fehlt, nicht crashen
  }
}
