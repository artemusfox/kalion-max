"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { setError("Mindestens 6 Zeichen"); return; }
    setLoading(true); setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setError(error.message); setLoading(false); }
    else { router.push("/dashboard"); router.refresh(); }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-title">Neues Passwort</div>
          <div className="auth-sub">Wähle ein neues Passwort für deinen Account</div>
        </div>
        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label className="form-label">Neues Passwort</label>
            <input className="form-input" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} required minLength={6} autoFocus />
          </div>
          {error && <div className="form-error" style={{ marginBottom: 16 }}>{error}</div>}
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? <div className="spinner" /> : "Passwort speichern"}
          </button>
        </form>
      </div>
    </div>
  );
}
