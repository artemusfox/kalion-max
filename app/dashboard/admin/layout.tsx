import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/dashboard");

  // AAL-Check: Admins MÜSSEN aal2 (= mit Faktor verifizierte Session) haben
  const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const { data: factorsData } = await supabase.auth.mfa.listFactors();
  const hasMfa = (factorsData?.totp ?? []).some((f: any) => f.status === "verified");

  if (!hasMfa) {
    // Admin hat noch kein MFA aktiv → muss erst einrichten
    redirect("/dashboard/settings?mfa-required=1");
  }

  if (aalData?.currentLevel !== "aal2") {
    // MFA aktiv aber Session erst aal1 → zu Challenge
    redirect("/auth/mfa-challenge?next=/dashboard/admin");
  }

  return (
    <div>
      <div style={{
        display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
        padding: "10px 14px", background: "var(--bg-elevated)",
        border: "1px solid var(--accent-border)", borderRadius: 12, marginBottom: 20,
      }}>
        <div style={{
          fontSize: 10, fontWeight: 800, letterSpacing: 2, padding: "4px 8px",
          background: "var(--accent)", color: "#0a0a10", borderRadius: 6,
        }}>ADMIN</div>
        <Link href="/dashboard/admin" className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: 12 }}>
          📊 Übersicht
        </Link>
        <Link href="/dashboard/admin/users" className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: 12 }}>
          👥 User
        </Link>
        <Link href="/dashboard/admin/audit" className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: 12 }}>
          📋 Audit-Log
        </Link>
        <div style={{ flex: 1 }} />
        <Link href="/dashboard" className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: 12 }}>
          ← App
        </Link>
      </div>
      {children}
    </div>
  );
}
