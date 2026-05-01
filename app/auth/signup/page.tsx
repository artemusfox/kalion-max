"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { useToast } from "@/components/Toast";
import { translateAuthError } from "@/lib/auth-errors";
import BrandLogo from "@/components/BrandLogo";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);

    if (password.length < 6) {
      setError("Passwort muss mindestens 6 Zeichen haben.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { display_name: displayName || email.split("@")[0] } },
    });

    if (error) {
      setError(translateAuthError(error.message));
      setLoading(false);
    } else if (data.session) {
      toast(`Willkommen bei KALION MAX! 🎉`, { type: "success" });
      router.push("/dashboard");
      router.refresh();
    } else {
      setSuccess(true);
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="auth-wrap">
        <div className="auth-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📧</div>
          <div className="auth-title">Fast geschafft!</div>
          <div className="auth-sub" style={{ marginTop: 12, lineHeight: 1.5 }}>
            Wir haben dir eine Bestätigungs-E-Mail an <strong style={{ color: "var(--text)" }}>{email}</strong> gesendet.
            Klicke auf den Link darin, um deinen Account zu aktivieren.
          </div>
          <Link href="/auth/login" className="btn btn-block" style={{ marginTop: 24 }}>
            Zum Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-header">
          <Link href="/" style={{ textDecoration: "none" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
              <BrandLogo size={56} textSize={26} />
            </div>
          </Link>
          <div className="auth-title">Account erstellen</div>
          <div className="auth-sub">Starte deine Trainings-Reise</div>
        </div>

        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label className="form-label">Anzeigename</label>
            <input
              className="form-input"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Max"
              maxLength={30}
            />
            <div className="form-hint">Wie sollen wir dich nennen?</div>
          </div>

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
              autoComplete="new-password"
              minLength={6}
              placeholder="Mind. 6 Zeichen"
            />
          </div>

          {error && <div className="form-error" style={{ marginBottom: 16 }}>{error}</div>}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? <div className="spinner" /> : "Account erstellen"}
          </button>
        </form>

        <div className="auth-switch">
          Schon einen Account? <Link href="/auth/login">Einloggen</Link>
        </div>

        <div style={{ marginTop: 20, fontSize: 11, color: "var(--text-muted)", textAlign: "center", lineHeight: 1.5 }}>
          Mit der Registrierung akzeptierst du unsere{" "}
          <Link href="/datenschutz" style={{ color: "var(--text-dim)" }}>Datenschutzerklärung</Link>.
        </div>
      </div>
    </div>
  );
}
