"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { useToast } from "@/components/Toast";
import { translateAuthError } from "@/lib/auth-errors";
import BrandLogo from "@/components/BrandLogo";
import LanguageSwitch from "@/components/LanguageSwitch";
import { useLanguage } from "@/components/LanguageProvider";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { t, lang } = useLanguage();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);

    if (password.length < 6) {
      setError(lang === "en" ? "Password must be at least 6 characters." : "Passwort muss mindestens 6 Zeichen haben.");
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
      toast(lang === "en" ? "Welcome to KALION MAX! 🎉" : "Willkommen bei KALION MAX! 🎉", { type: "success" });
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
          <div className="auth-title">
            {lang === "en" ? "Almost there!" : "Fast geschafft!"}
          </div>
          <div className="auth-sub" style={{ marginTop: 12, lineHeight: 1.5 }}>
            {lang === "en" ? (
              <>We sent a confirmation email to <strong style={{ color: "var(--text)" }}>{email}</strong>. Click the link to activate your account.</>
            ) : (
              <>Wir haben dir eine Bestätigungs-E-Mail an <strong style={{ color: "var(--text)" }}>{email}</strong> gesendet. Klicke auf den Link darin, um deinen Account zu aktivieren.</>
            )}
          </div>
          <Link href="/auth/login" className="btn btn-block" style={{ marginTop: 24 }}>
            {t("auth.signin.link")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <LanguageSwitch compact />
        </div>
        <div className="auth-header">
          <Link href="/" style={{ textDecoration: "none" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
              <BrandLogo size={56} textSize={26} />
            </div>
          </Link>
          <div className="auth-title">{t("auth.signup.title")}</div>
          <div className="auth-sub">{t("auth.signup.sub")}</div>
        </div>

        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label className="form-label">{t("auth.signup.name")}</label>
            <input
              className="form-input"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t("auth.signup.name.ph")}
              maxLength={30}
            />
            <div className="form-hint">{lang === "en" ? "What should we call you?" : "Wie sollen wir dich nennen?"}</div>
          </div>

          <div className="form-group">
            <label className="form-label">{t("common.email")}</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder={t("auth.email.ph")}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t("common.password")}</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={6}
              placeholder={lang === "en" ? "At least 6 characters" : "Mind. 6 Zeichen"}
            />
          </div>

          {error && <div className="form-error" style={{ marginBottom: 16 }}>{error}</div>}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? <div className="spinner" /> : t("auth.signup.btn")}
          </button>
        </form>

        <div className="auth-switch">
          {t("auth.have.account")} <Link href="/auth/login">{t("auth.signin.link")}</Link>
        </div>

        <div style={{ marginTop: 20, fontSize: 11, color: "var(--text-muted)", textAlign: "center", lineHeight: 1.5 }}>
          {lang === "en" ? (
            <>By registering you accept our <Link href="/datenschutz" style={{ color: "var(--text-dim)" }}>privacy policy</Link>.</>
          ) : (
            <>Mit der Registrierung akzeptierst du unsere <Link href="/datenschutz" style={{ color: "var(--text-dim)" }}>Datenschutzerklärung</Link>.</>
          )}
        </div>
      </div>
    </div>
  );
}
