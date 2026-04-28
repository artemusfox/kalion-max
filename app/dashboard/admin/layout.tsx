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
