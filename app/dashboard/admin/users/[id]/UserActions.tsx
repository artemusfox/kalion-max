"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { useToast } from "@/components/Toast";

export default function UserActions({
  userId, userEmail, userName, isAdmin, isMe, isProGranted, isModerator,
}: {
  userId: string;
  userEmail?: string;
  userName?: string;
  isAdmin: boolean;
  isMe: boolean;
  isProGranted?: boolean;
  isModerator?: boolean;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggleAdmin() {
    const action = isAdmin ? "Admin-Rechte ENTZIEHEN" : "Admin-Rechte ERTEILEN";
    if (!confirm(`${action} für "${userName || userEmail}"?`)) return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("admin_set_is_admin", {
      p_user_id: userId, p_is_admin: !isAdmin,
    });
    setBusy(false);
    if (error) { toast("Fehler: " + error.message, { type: "error" }); return; }
    toast(isAdmin ? "Admin-Rechte entzogen" : "Admin-Rechte erteilt", { type: "success", icon: "🛡️" });
    router.refresh();
  }

  async function deleteUser() {
    if (isMe) { toast("Du kannst dich selbst nicht löschen", { type: "error" }); return; }
    const expected = userEmail || userName || userId.slice(0, 8);
    const typed = prompt(`User "${expected}" wird ENDGÜLTIG gelöscht — alle Workouts, PRs, Fotos. Tippe zur Bestätigung "${expected}":`);
    if (typed !== expected) { toast("Abgebrochen", { type: "info" }); return; }
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("admin_delete_user", { p_user_id: userId });
    setBusy(false);
    if (error) { toast("Fehler: " + error.message, { type: "error" }); return; }
    toast("User gelöscht", { type: "success", icon: "🗑️" });
    router.push("/dashboard/admin/users");
  }

  async function toggleProGrant() {
    const next = !isProGranted;
    const action = next ? "Pro KOSTENFREI freischalten" : "Pro-Grant ENTZIEHEN";
    if (!confirm(`${action} für "${userName || userEmail}"?`)) return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("admin_set_pro_grant", {
      p_user_id: userId, p_granted: next,
    });
    setBusy(false);
    if (error) { toast("Fehler: " + error.message, { type: "error" }); return; }
    toast(next ? "Pro freigeschaltet 💎" : "Pro-Grant entfernt", {
      type: "success", icon: next ? "💎" : "↩",
    });
    router.refresh();
  }

  async function toggleModerator() {
    const action = isModerator ? "Moderator-Rechte ENTZIEHEN" : "Moderator-Rechte ERTEILEN";
    if (!confirm(`${action} für "${userName || userEmail}"?`)) return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("admin_set_is_moderator", {
      p_user_id: userId, p_is_mod: !isModerator,
    });
    setBusy(false);
    if (error) { toast("Fehler: " + error.message, { type: "error" }); return; }
    toast(isModerator ? "Moderator-Rechte entzogen" : "Moderator-Rechte erteilt", { type: "success", icon: "🌟" });
    router.refresh();
  }

  async function resetMfa() {
    if (!confirm(`2FA von "${userName || userEmail}" zurücksetzen? Der User muss sich danach neu einrichten.`)) return;
    setBusy(true);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("admin_remove_user_mfa", { p_user_id: userId });
    setBusy(false);
    if (error) { toast("Fehler: " + error.message, { type: "error" }); return; }
    toast(`2FA zurückgesetzt (${data ?? 0} Faktor${data === 1 ? "" : "en"})`, { type: "success", icon: "🔓" });
    router.refresh();
  }

  return (
    <div className="card">
      <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 14 }}>🛡️ Account-Management</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
        <button
          className="btn btn-block"
          onClick={toggleAdmin}
          disabled={busy || isMe}
          style={{
            border: isAdmin ? "1px solid var(--accent)" : "1px solid var(--border)",
            background: isAdmin ? "var(--accent-tint)" : "var(--bg-elevated)",
            color: isAdmin ? "var(--accent)" : "var(--text)",
          }}
        >
          {isAdmin ? "🛡️ Admin entziehen" : "🛡️ Admin machen"}
        </button>

        <button
          className="btn btn-block"
          onClick={toggleProGrant}
          disabled={busy}
          style={{
            border: isProGranted ? "1px solid var(--accent)" : "1px solid var(--border)",
            background: isProGranted ? "var(--accent-tint)" : "var(--bg-elevated)",
            color: isProGranted ? "var(--accent)" : "var(--text)",
          }}
        >
          {isProGranted ? "💎 Pro entziehen" : "💎 Pro kostenfrei"}
        </button>

        <button
          className="btn btn-block"
          onClick={toggleModerator}
          disabled={busy}
          style={{
            border: isModerator ? "1px solid var(--accent)" : "1px solid var(--border)",
            background: isModerator ? "var(--accent-tint)" : "var(--bg-elevated)",
            color: isModerator ? "var(--accent)" : "var(--text)",
          }}
        >
          {isModerator ? "🌟 Mod entziehen" : "🌟 Mod machen"}
        </button>

        <button
          className="btn btn-block"
          onClick={resetMfa}
          disabled={busy}
        >
          🔓 2FA zurücksetzen
        </button>

        <button
          className="btn btn-block"
          onClick={deleteUser}
          disabled={busy || isMe}
          style={{
            border: "1px solid rgba(255,90,107,0.3)",
            background: "transparent",
            color: "var(--red)",
          }}
        >
          🗑️ Account löschen
        </button>
      </div>
      {isMe && (
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8, textAlign: "center" }}>
          Auf deinen eigenen Account kannst du diese Aktionen nicht anwenden.
        </div>
      )}
    </div>
  );
}
