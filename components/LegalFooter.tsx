"use client";

import Link from "next/link";
import { reopenConsentDialog } from "@/lib/consent";

export default function LegalFooter() {
  return (
    <footer style={{
      marginTop: 60,
      padding: "24px 20px",
      borderTop: "1px solid var(--border)",
      textAlign: "center",
      fontSize: 12,
      color: "var(--text-muted)",
    }}>
      <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap", marginBottom: 8 }}>
        <Link href="/impressum" style={{ color: "var(--text-dim)", textDecoration: "none", fontWeight: 600 }}>
          Impressum
        </Link>
        <Link href="/datenschutz" style={{ color: "var(--text-dim)", textDecoration: "none", fontWeight: 600 }}>
          Datenschutz
        </Link>
        <button
          onClick={reopenConsentDialog}
          style={{
            background: "transparent", border: "none", padding: 0,
            color: "var(--text-dim)", textDecoration: "none", fontWeight: 600,
            fontFamily: "inherit", fontSize: "inherit", cursor: "pointer",
          }}
        >
          Cookie-Einstellungen
        </button>
      </div>
      <div style={{ fontSize: 11, opacity: 0.6 }}>
        © {new Date().getFullYear()} KALION MAX
      </div>
    </footer>
  );
}
