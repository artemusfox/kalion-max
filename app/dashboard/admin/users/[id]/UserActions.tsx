"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { useToast } from "@/components/Toast";

export default function UserActions({
  userId, userEmail, userName, isAdmin, isMe,
}: {
  userId: string;
  userEmail?: string;
  userName?: string;
  isAdmin: boolean;
  isMe: boolean;
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
