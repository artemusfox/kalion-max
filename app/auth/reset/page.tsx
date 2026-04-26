"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";

export default function ResetPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    if (error) { setError(error.message); setLoading(false); }
    else { setSent(true); setLoading(false); }
  }

  if (sent) {
    return (
      <div className="auth-wrap">
        <div className="auth-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>✉️</div>
          <div className="auth-title">E-Mail gesendet</div>
          <div className="auth-sub" style={{ marginTop: 12, lineHeight: 1.5 }}>
            Wir haben dir einen Link zum Zurücksetzen deines Passworts gesendet.
          </div>
          <Link href="/auth/login" className="btn btn-block" style={{ marginTop: 24 }}>
            Zurück zum Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-title">Passwort vergessen?</div>
          <div className="auth-sub">Wir senden dir einen Reset-Link per E-Mail</div>
        </div>

        <form onSubmit={handleReset}>
          <div className="form-group">
            <label className="form-label">E-Mail</label>
            <input
              className="form-input" type="email"
              value={email} onChange={(e) => setEmail(e.target.value)}
              required autoComplete="email" placeholder="du@example.com"
            />
          </div>
          {error && <div className="form-error" style={{ marginBottom: 16 }}>{error}</div>}
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? <div className="spinner" /> : "Reset-Link senden"}
          </button>
        </form>

        <div className="auth-switch">
          <Link href="/auth/login">← Zurück zum Login</Link>
        </div>
      </div>
    </div>
  );
}
