import { createClient } from "@/lib/supabase-server";

export default async function AdminAuditPage() {
  const supabase = await createClient();
  const { data: log } = await supabase
    .from("admin_audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 14 }}>📋 Audit-Log</h1>
      <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 20 }}>
        Letzte 200 Admin-Aktionen, neueste zuerst.
      </p>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 700 }}>
            <thead>
              <tr style={{ background: "var(--bg-elevated)" }}>
                <Th>Zeitpunkt</Th>
                <Th>Admin</Th>
                <Th>Aktion</Th>
                <Th>Ziel-User</Th>
                <Th>Details</Th>
              </tr>
            </thead>
            <tbody>
              {(log || []).map((a: any) => (
                <tr key={a.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <Td muted>{new Date(a.created_at).toLocaleString("de-DE")}</Td>
                  <Td>{a.admin_email || "—"}</Td>
                  <Td><strong style={{ color: actionColor(a.action) }}>{a.action}</strong></Td>
                  <Td muted>{a.target_user_email || "—"}</Td>
                  <Td muted>
                    <code style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
                      {a.details && Object.keys(a.details).length > 0 ? JSON.stringify(a.details) : "—"}
                    </code>
                  </Td>
                </tr>
              ))}
              {(!log || log.length === 0) && (
                <tr><Td>Noch keine Einträge</Td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function actionColor(action: string) {
  if (action.includes("delete")) return "var(--red)";
  if (action.includes("grant")) return "var(--green)";
  if (action.includes("revoke")) return "var(--amber)";
  return "var(--accent)";
}

function Th({ children }: { children: React.ReactNode }) {
  return <th style={{
    textAlign: "left", padding: "10px 14px", fontSize: 10,
    fontWeight: 800, color: "var(--text-muted)", letterSpacing: 1, textTransform: "uppercase",
  }}>{children}</th>;
}

function Td({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return <td style={{
    padding: "10px 14px", fontSize: 12,
    color: muted ? "var(--text-dim)" : "var(--text)", verticalAlign: "top",
  }}>{children}</td>;
}
