"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { useToast } from "@/components/Toast";
import { translateAuthError } from "@/lib/auth-errors";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(translateAuthError(error.message));
      setLoading(false);
    } else {
      toast("Willkommen zurück! ⚡", { type: "success" });
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-header">
          <Link href="/" style={{ textDecoration: "none" }}>
            <div className="brand" style={{ fontSize: 28, marginBottom: 8, display: "flex", justifyContent: "center" }}>
              <span className="brand-kalion">KALION</span>
              <span className="brand-bolt">⚡</span>
              <span className="brand-max">MAX</span>
            </div>
          </Link>
          <div className="auth-title">Willkommen zurück</div>
          <div className="auth-sub">Melde dich mit deinem Account an</div>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">E-Mail</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="du@example.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Passwort</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>

          {error && <div className="form-error" style={{ marginBottom: 16 }}>{error}</div>}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? <div className="spinner" /> : "Einloggen"}
          </button>
        </form>

        <div className="auth-switch">
          Noch keinen Account? <Link href="/auth/signup">Registrieren</Link>
        </div>
        <div className="auth-switch" style={{ marginTop: 8 }}>
          <Link href="/auth/reset" style={{ color: "var(--text-muted)" }}>Passwort vergessen?</Link>
        </div>
      </div>
    </div>
  );
}
