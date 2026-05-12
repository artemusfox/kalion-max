import { createClient } from "@/lib/supabase-server";
import Link from "next/link";
import { notFound } from "next/navigation";
import UserActions from "./UserActions";

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: profile },
    { data: emails },
    { count: workoutCount },
    { count: prCount },
    { data: workouts },
    { data: prs },
    { data: measurements },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).single(),
    supabase.rpc("admin_user_emails"),
    supabase.from("workouts").select("*", { count: "exact", head: true }).eq("user_id", id),
    supabase.from("personal_records").select("*", { count: "exact", head: true }).eq("user_id", id),
    supabase.from("workouts").select("*").eq("user_id", id).order("started_at", { ascending: false }).limit(10),
    supabase.from("personal_records").select("*").eq("user_id", id).order("recorded_at", { ascending: false }).limit(10),
    supabase.from("body_measurements").select("*").eq("user_id", id).order("recorded_at", { ascending: false }).limit(5),
  ]);

  if (!profile) notFound();

  const userEmail = ((emails || []) as any[]).find((e) => e.id === id);
  const { data: { user: me } } = await supabase.auth.getUser();
  const isMe = me?.id === id;

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <Link href="/dashboard/admin/users" className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }}>
          ← Zurück
        </Link>
      </div>

      <div className="card">
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, fontWeight: 800, color: "#0a0a10",
          }}>
            {(profile.display_name || userEmail?.email || "?")[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{ fontSize: 22, marginBottom: 4 }}>
              {profile.display_name || "(ohne Namen)"}
              {profile.is_admin && (
                <span style={{
                  fontSize: 10, fontWeight: 800, padding: "2px 6px", marginLeft: 10,
                  background: "var(--accent-tint)", color: "var(--accent)",
                  border: "1px solid var(--accent-border)", borderRadius: 4,
                  verticalAlign: "middle",
                }}>ADMIN</span>
              )}
              {profile.is_pro_granted && !profile.is_admin && (
                <span style={{
                  fontSize: 10, fontWeight: 800, padding: "2px 6px", marginLeft: 10,
                  background: "var(--accent-tint)", color: "var(--accent)",
                  border: "1px solid var(--accent-border)", borderRadius: 4,
                  verticalAlign: "middle",
                }}>💎 PRO (GRANTED)</span>
              )}
            </h1>
            <div style={{ fontSize: 13, color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
              {userEmail?.email || id}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
              Registriert: {userEmail?.created_at ? new Date(userEmail.created_at).toLocaleString("de-DE") : "—"}
              {" · "}
              Letzter Login: {userEmail?.last_sign_in_at ? new Date(userEmail.last_sign_in_at).toLocaleString("de-DE") : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Aktionen */}
      <UserActions
        userId={id}
        userEmail={userEmail?.email}
        userName={profile.display_name}
        isAdmin={profile.is_admin}
        isProGranted={profile.is_pro_granted}
        isMe={isMe}
      />

      {/* Stats */}
      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 14 }}>📊 Stats</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
          <Stat icon="💪" label="Workouts" value={workoutCount || 0} />
          <Stat icon="🏆" label="PRs" value={prCount || 0} />
          <Stat icon="🔥" label="Streak" value={profile.current_streak || 0} />
          <Stat icon="👑" label="Best" value={profile.best_streak || 0} />
          <Stat icon="⭐" label="XP" value={profile.xp || 0} />
          <Stat icon="🎯" label="Level" value={profile.level || 1} />
        </div>
      </div>

      {/* Letzte Workouts */}
      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 14 }}>📋 Letzte Workouts</div>
        {(workouts || []).length === 0 ? (
          <div style={{ fontSize: 12, color: "var(--text-muted)", padding: 12, textAlign: "center" }}>Keine</div>
        ) : (
          (workouts || []).map((w: any) => (
            <div key={w.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
              <strong>{w.day_name}</strong>
              <span style={{ color: "var(--text-muted)", marginLeft: 8, fontSize: 11 }}>
                {new Date(w.started_at).toLocaleDateString("de-DE")} · {w.completed_sets}/{w.total_sets} Sätze · {w.total_volume || 0} kg
              </span>
            </div>
          ))
        )}
      </div>

      {/* PRs */}
      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 14 }}>🏆 Personal Records</div>
        {(prs || []).length === 0 ? (
          <div style={{ fontSize: 12, color: "var(--text-muted)", padding: 12, textAlign: "center" }}>Keine</div>
        ) : (
          (prs || []).map((pr: any) => (
            <div key={pr.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 13, display: "flex", justifyContent: "space-between" }}>
              <span><strong>{pr.exercise_name}</strong> {pr.reps && `× ${pr.reps}`}</span>
              <span style={{ color: "var(--accent)", fontWeight: 800 }}>{pr.value} {pr.unit}</span>
            </div>
          ))
        )}
      </div>

      {/* Maße */}
      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 14 }}>📏 Letzte Maße</div>
        {(measurements || []).length === 0 ? (
          <div style={{ fontSize: 12, color: "var(--text-muted)", padding: 12, textAlign: "center" }}>Keine</div>
        ) : (
          (measurements || []).map((m: any) => (
            <div key={m.id} style={{ padding: "6px 0", fontSize: 13, display: "flex", justifyContent: "space-between" }}>
              <span style={{ textTransform: "capitalize" }}>{m.measurement_type}</span>
              <span><strong>{m.value}</strong> {m.unit} <span style={{ color: "var(--text-muted)", fontSize: 11 }}>· {new Date(m.recorded_at).toLocaleDateString("de-DE")}</span></span>
            </div>
          ))
        )}
      </div>

      {/* Export */}
      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>💾 Export</div>
        <a
          href={`/api/admin/export-user?id=${id}`}
          className="btn btn-block"
        >⬇️ Komplette User-Daten als JSON</a>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div style={{ padding: 12, background: "var(--bg-elevated)", borderRadius: 10, border: "1px solid var(--border)" }}>
      <div style={{ fontSize: 18 }}>{icon}</div>
      <div style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: 1.2, fontWeight: 800, textTransform: "uppercase", marginTop: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, marginTop: 2 }}>{value}</div>
    </div>
  );
}
