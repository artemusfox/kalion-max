import { createClient } from "@/lib/supabase-server";
import Link from "next/link";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const [{ data: profiles }, { data: emails }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.rpc("admin_user_emails"),
  ]);

  // Mappe email + last_sign_in zur profile
  const emailMap: Record<string, { email: string; created_at: string; last_sign_in_at: string | null }> = {};
  for (const e of (emails || []) as any[]) emailMap[e.id] = e;

  // Workout-Counts pro User (eine kompakte Aggregation)
  const { data: workoutCounts } = await supabase
    .from("workouts")
    .select("user_id")
    .order("user_id");
  const workoutsByUser: Record<string, number> = {};
  for (const w of (workoutCounts || []) as any[]) {
    workoutsByUser[w.user_id] = (workoutsByUser[w.user_id] || 0) + 1;
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <h1 style={{ fontSize: 22 }}>👥 User ({profiles?.length || 0})</h1>
        <Link href="/api/admin/export-users" className="btn">💾 CSV-Export</Link>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{
            width: "100%", borderCollapse: "collapse",
            fontSize: 13, minWidth: 700,
          }}>
            <thead>
              <tr style={{ background: "var(--bg-elevated)" }}>
                <Th>User</Th>
                <Th>Registriert</Th>
                <Th>Letzter Login</Th>
                <Th>Workouts</Th>
                <Th>Streak</Th>
                <Th>XP</Th>
                <Th>Admin</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {(profiles || []).map((p: any) => {
                const e = emailMap[p.id];
                return (
                  <tr key={p.id} style={{ borderTop: "1px solid var(--border)" }}>
                    <Td>
                      <div style={{ fontWeight: 700 }}>{p.display_name || "(ohne Namen)"}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                        {e?.email || p.id.slice(0, 8)}
                      </div>
                    </Td>
                    <Td muted>{e?.created_at ? new Date(e.created_at).toLocaleDateString("de-DE") : "—"}</Td>
                    <Td muted>{e?.last_sign_in_at ? new Date(e.last_sign_in_at).toLocaleDateString("de-DE") : "—"}</Td>
                    <Td>{workoutsByUser[p.id] || 0}</Td>
                    <Td>🔥 {p.current_streak || 0}</Td>
                    <Td>{p.xp || 0}</Td>
                    <Td>
                      {p.is_admin ? (
                        <span style={{
                          fontSize: 10, fontWeight: 800, padding: "2px 6px",
                          background: "var(--accent-tint)", color: "var(--accent)",
                          border: "1px solid var(--accent-border)", borderRadius: 4,
                        }}>ADMIN</span>
                      ) : <span style={{ color: "var(--text-muted)" }}>—</span>}
                    </Td>
                    <Td>
                      <Link
                        href={`/dashboard/admin/users/${p.id}`}
                        className="btn btn-ghost"
                        style={{ padding: "4px 10px", fontSize: 11 }}
                      >Detail →</Link>
                    </Td>
                  </tr>
                );
              })}
              {(!profiles || profiles.length === 0) && (
                <tr><Td>Keine User</Td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th style={{
    textAlign: "left", padding: "10px 14px", fontSize: 10,
    fontWeight: 800, color: "var(--text-muted)", letterSpacing: 1,
    textTransform: "uppercase",
  }}>{children}</th>;
}

function Td({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return <td style={{
    padding: "12px 14px", fontSize: 13,
    color: muted ? "var(--text-dim)" : "var(--text)",
    verticalAlign: "top",
  }}>{children}</td>;
}
