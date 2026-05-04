"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { useToast } from "@/components/Toast";
import { useLanguage } from "@/components/LanguageProvider";
import type { Provider } from "@supabase/supabase-js";

type OAuthProvider = "google" | "github" | "apple";

const PROVIDERS: { id: OAuthProvider; label: string; icon: string; bg: string; color: string; border: string }[] = [
  {
    id: "google",
    label: "Google",
    icon: "G",
    bg: "#ffffff",
    color: "#1f1f1f",
    border: "#dadce0",
  },
  {
    id: "github",
    label: "GitHub",
    icon: "",
    bg: "#24292e",
    color: "#ffffff",
    border: "#24292e",
  },
  {
    id: "apple",
    label: "Apple",
    icon: "",
    bg: "#000000",
    color: "#ffffff",
    border: "#000000",
  },
];

export default function OAuthButtons({ enabledProviders = ["google"] }: { enabledProviders?: OAuthProvider[] }) {
  const { toast } = useToast();
  const { lang } = useLanguage();
  const [loading, setLoading] = useState<OAuthProvider | null>(null);

  async function signInWith(provider: OAuthProvider) {
    setLoading(provider);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider as Provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      toast(
        lang === "en"
          ? `${provider} sign-in failed: ${error.message}`
          : `${provider} Login fehlgeschlagen: ${error.message}`,
        { type: "error" }
      );
      setLoading(null);
    }
    // Bei Erfolg: Browser wird zum Provider weitergeleitet → kein setLoading(null) nötig
  }

  const list = PROVIDERS.filter((p) => enabledProviders.includes(p.id));
  if (list.length === 0) return null;

  return (
    <div>
      <div style={{
        display: "flex", alignItems: "center", gap: 12, margin: "20px 0",
      }}>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        <span style={{
          fontSize: 10, color: "var(--text-muted)", letterSpacing: 2,
          fontWeight: 800, textTransform: "uppercase",
        }}>
          {lang === "en" ? "or continue with" : "oder weiter mit"}
        </span>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: list.length === 1 ? "1fr" : "repeat(auto-fit, minmax(120px, 1fr))",
        gap: 8,
      }}>
        {list.map((p) => (
          <button
            key={p.id}
            onClick={() => signInWith(p.id)}
            disabled={loading !== null}
            style={{
              padding: "11px 14px",
              borderRadius: 12,
              background: p.bg,
              color: p.color,
              border: `1px solid ${p.border}`,
              cursor: loading !== null ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              fontSize: 13,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              opacity: loading !== null && loading !== p.id ? 0.5 : 1,
              transition: "transform 0.15s, opacity 0.2s",
            }}
            onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.98)"; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            {loading === p.id ? (
              <div className="spinner" style={{ borderColor: `${p.color}40`, borderTopColor: p.color }} />
            ) : (
              <>
                <ProviderIcon id={p.id} color={p.color} />
                <span>{p.label}</span>
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function ProviderIcon({ id, color }: { id: OAuthProvider; color: string }) {
  if (id === "google") {
    // Google "G" multi-color (offizielles Logo-Pattern)
    return (
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
        <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
        <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
        <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"/>
        <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
      </svg>
    );
  }
  if (id === "github") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill={color} aria-hidden>
        <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.78-.25.78-.56v-2.16c-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.17a10.94 10.94 0 015.74 0c2.19-1.48 3.15-1.17 3.15-1.17.62 1.59.23 2.76.11 3.05.74.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.37-5.25 5.65.41.36.78 1.06.78 2.13v3.16c0 .31.21.67.79.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"/>
      </svg>
    );
  }
  if (id === "apple") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill={color} aria-hidden>
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.55C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
    );
  }
  return null;
}
