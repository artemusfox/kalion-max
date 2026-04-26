import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import LegalFooter from "@/components/LegalFooter";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <div className="auth-wrap">
      <div style={{ maxWidth: 720, textAlign: "center" }}>
        <div style={{ marginBottom: 36 }}>
          <div className="brand" style={{ fontSize: 64, marginBottom: 20, display: "flex", justifyContent: "center" }}>
            <span className="brand-kalion">KALION</span>
            <span className="brand-bolt">⚡</span>
            <span className="brand-max">MAX</span>
          </div>
          <p style={{ fontSize: 19, color: "var(--text-dim)", maxWidth: 520, margin: "0 auto", lineHeight: 1.5 }}>
            Deine Trainings-App für <strong style={{ color: "var(--text)" }}>alle Sportarten</strong>.  
            Plane, tracke und dominiere dein Training — egal ob Kurzhantel, Barren, Asphalt oder Yoga-Matte.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
          <Link href="/auth/signup" className="btn btn-primary" style={{ padding: "18px 36px", fontSize: 15 }}>
            Kostenlos starten →
          </Link>
          <Link href="/auth/login" className="btn" style={{ padding: "18px 36px", fontSize: 15 }}>
            Einloggen
          </Link>
        </div>

        {/* Sports grid */}
        <div style={{ marginBottom: 40 }}>
          <div style={{
            fontSize: 11, color: "var(--text-muted)", letterSpacing: 3,
            textTransform: "uppercase", fontWeight: 800, marginBottom: 16,
          }}>Für jede Sportart</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
            {[
              { icon: "🏋️", label: "Gym & Gewicht", color: "#FF5A6B" },
              { icon: "💪", label: "Calisthenics", color: "#2DD4BF" },
              { icon: "🏃", label: "Cardio", color: "#60A5FA" },
              { icon: "🔥", label: "HIIT / Functional", color: "#FFB800" },
              { icon: "🧘", label: "Mobility / Yoga", color: "#8B7FF0" },
            ].map((s, i) => (
              <div key={i} className="card" style={{
                padding: 20, marginBottom: 0, textAlign: "center",
                borderTop: `3px solid ${s.color}`,
              }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 800 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          {[
            { icon: "📋", title: "Flexible Pläne", desc: "Vorlagen nutzen oder komplett eigene Workouts erstellen" },
            { icon: "🎯", title: "Smart-Tracking", desc: "Gewicht, Reps, Zeit, Distanz — je nach Übung passend" },
            { icon: "📊", title: "Fortschritt", desc: "PRs, Level, XP, Badges und Streak-System" },
            { icon: "📏", title: "Körperdaten", desc: "Messungen, Fotos, Ernährung und Recovery" },
          ].map((f, i) => (
            <div key={i} className="card" style={{ padding: 22, marginBottom: 0, textAlign: "left" }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        <LegalFooter />
      </div>
    </div>
  );
}
