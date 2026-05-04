import { createClient } from "@/lib/supabase-server";
import Link from "next/link";
import UserGeoMap from "@/components/UserGeoMap";

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  // Diese Calls funktionieren dank Admin-RLS-Policies
  const [
    { count: userCount },
    { count: workoutCount },
    { count: prCount },
    { count: planCount },
    { count: photoCount },
    { data: recentAudit },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("workouts").select("*", { count: "exact", head: true }),
    supabase.from("personal_records").select("*", { count: "exact", head: true }),
    supabase.from("user_plans").select("*", { count: "exact", head: true }),
    supabase.from("progress_photos").select("*", { count: "exact", head: true }),
    supabase.from("admin_audit_log").select("*").order("created_at", { ascending: false }).limit(5),
  ]);

  const stats = [
    { label: "User",      value: userCount     ?? 0, icon: "👥", color: "var(--coral)" },
    { label: "Workouts",  value: workoutCount  ?? 0, icon: "💪", color: "var(--teal)" },
    { label: "PRs",       value: prCount       ?? 0, icon: "🏆", color: "var(--amber)" },
    { label: "Pläne",     value: planCount     ?? 0, icon: "📋", color: "var(--blue)" },
    { label: "Fotos",     value: photoCount    ?? 0, icon: "📸", color: "var(--purple)" },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Admin-Übersicht</h1>
      <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 20 }}>
        Globale Statistiken aller registrierten User und ihrer Daten.
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: 12, marginBottom: 20,
      }}>
        {stats.map((s) => (
          <div key={s.label} style={{
            padding: 16, background: "var(--bg-elevated)",
            border: "1px solid var(--border)", borderRadius: 12,
          }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: 1.5, fontWeight: 800, textTransform: "uppercase" }}>
              {s.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1, marginTop: 4 }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 800 }}>📋 Letzte Admin-Aktionen</div>
          <Link href="/dashboard/admin/audit" className="btn btn-ghost" style={{ fontSize: 12, padding: "6px 12px" }}>
            Alle anzeigen →
          </Link>
        </div>
        {recentAudit && recentAudit.length > 0 ? (
          recentAudit.map((a: any) => (
            <div key={a.id} style={{
              display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)",
              fontSize: 12,
            }}>
              <div style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>
                {new Date(a.created_at).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" })}
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ color: "var(--accent)" }}>{a.action}</strong>
                {a.target_user_email && <span style={{ color: "var(--text-dim)" }}> → {a.target_user_email}</span>}
              </div>
            </div>
          ))
        ) : (
          <div style={{ fontSize: 12, color: "var(--text-muted)", padding: 20, textAlign: "center" }}>
            Noch keine Aktionen geloggt.
          </div>
        )}
      </div>

      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>🌍 User-Geo</div>
        <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 14 }}>
          Wo deine User herkommen — automatisch via Vercel-Geo-Headers, anonymisiert aggregiert.
        </div>
        <UserGeoMap />
      </div>

      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 14 }}>⚡ Schnell-Aktionen</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
          <Link href="/dashboard/admin/users" className="btn btn-block">👥 User verwalten</Link>
          <Link href="/dashboard/admin/audit" className="btn btn-block">📋 Audit-Log</Link>
          <Link href="/api/admin/export-all" className="btn btn-block">💾 Komplett-Export</Link>
        </div>
      </div>
    </div>
  );
}
