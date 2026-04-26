"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { TEMPLATES } from "@/lib/templates";
import { SPORT_LABELS, SPORT_ICONS, SPORT_COLORS, type Sport, type Plan } from "@/lib/types";
import { useToast } from "@/components/Toast";
import { EmptyState, SkeletonList } from "@/components/UI";

export default function PlansPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [tab, setTab] = useState<"mine" | "templates">("mine");
  const [sportFilter, setSportFilter] = useState<Sport | "all">("all");
  const [userPlans, setUserPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("user_plans").select("*")
      .eq("is_archived", false)
      .order("created_at", { ascending: false });
    setUserPlans(data || []);
    const { data: profile } = await supabase.from("profiles")
      .select("active_plan_id").single();
    setActivePlanId(profile?.active_plan_id || null);
    setLoading(false);
  }

  async function cloneTemplate(template: Plan) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase.from("user_plans").insert({
      user_id: user.id,
      name: template.name,
      description: template.description,
      sport: template.sport,
      level: template.level,
      duration_weeks: template.durationWeeks,
      plan_data: { weeks: template.weeks },
      source_template_id: template.id,
    }).select().single();
    if (error) { toast(error.message, { type: "error" }); return; }
    await supabase.from("profiles").update({
      active_plan_id: data.id, active_sport: template.sport,
    }).eq("id", user.id);
    toast(`"${template.name}" übernommen & als aktiv gesetzt`, { type: "success", icon: "⚡" });
    router.push(`/dashboard/plans/${data.id}`);
  }

  async function setActive(planId: string, sport: string, name: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("profiles").update({
      active_plan_id: planId, active_sport: sport,
    }).eq("id", user.id);
    setActivePlanId(planId);
    toast(`"${name}" ist dein aktiver Plan`, { type: "success", icon: "✓" });
  }

  async function deletePlan(id: string, name: string) {
    if (!confirm(`"${name}" wirklich löschen?`)) return;
    const supabase = createClient();
    await supabase.from("user_plans").delete().eq("id", id);
    toast("Plan gelöscht", { type: "info", icon: "🗑" });
    load();
  }

  const filteredTemplates = sportFilter === "all"
    ? TEMPLATES : TEMPLATES.filter((t) => t.sport === sportFilter);

  return (
    <div>
      {/* Tabs */}
      <div style={{
        display: "flex", gap: 4, padding: 4, background: "var(--bg-raised)",
        border: "1px solid var(--border)", borderRadius: 14, marginBottom: 20,
      }}>
        {(["mine", "templates"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: 10, borderRadius: 10, border: "none",
            background: tab === t ? "var(--bg-elevated)" : "transparent",
            color: tab === t ? "var(--text)" : "var(--text-muted)",
            cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 700,
          }}>{t === "mine" ? "📋 Meine Pläne" : "✨ Vorlagen"}</button>
        ))}
      </div>

      {/* Sport filter */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        <FilterChip active={sportFilter === "all"} onClick={() => setSportFilter("all")} label="Alle Sportarten" />
        {(Object.keys(SPORT_LABELS) as Sport[]).map((s) => (
          <FilterChip key={s} active={sportFilter === s} onClick={() => setSportFilter(s)}
            label={`${SPORT_ICONS[s]} ${SPORT_LABELS[s]}`} color={SPORT_COLORS[s]} />
        ))}
      </div>

      {tab === "mine" ? (
        loading ? <SkeletonList count={3} />
        : userPlans.filter((p) => sportFilter === "all" || p.sport === sportFilter).length === 0 ? (
          <EmptyState
            icon="📋"
            title="Noch keine eigenen Pläne"
            description="Klone eine Vorlage oder erstelle deinen eigenen Plan von Grund auf."
            action={{ label: "✨ Vorlagen ansehen", onClick: () => setTab("templates") }}
            secondaryAction={{ label: "+ Eigenen Plan erstellen", onClick: () => router.push("/dashboard/plans/new") }}
          />
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <Link href="/dashboard/plans/new" className="btn btn-primary btn-block">
                + Neuen Plan erstellen
              </Link>
            </div>
            <div className="stagger">
            {userPlans.filter((p) => sportFilter === "all" || p.sport === sportFilter).map((p) => {
              const sport = p.sport as Sport;
              const isActive = activePlanId === p.id;
              return (
                <div key={p.id} className="card card-hover" style={{
                  borderColor: isActive ? "var(--accent)" : "var(--border)",
                  background: isActive ? "var(--accent-tint)" : "var(--bg-raised)",
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                    <div style={{ fontSize: 36 }}>{SPORT_ICONS[sport]}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                        <h3 style={{ fontSize: 18, fontStyle: "italic" }}>{p.name}</h3>
                        {isActive && (
                          <span className="sport-pill animate-pop" style={{ background: "var(--accent-tint)", color: "var(--accent)", border: "1px solid var(--accent)" }}>
                            AKTIV
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 10 }}>
                        {p.description}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                        {SPORT_LABELS[sport]} · {p.level} · {p.duration_weeks} Wochen
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
                    <Link href={`/dashboard/plans/${p.id}`} className="btn">📝 Bearbeiten</Link>
                    {!isActive && (
                      <button className="btn btn-primary" onClick={() => setActive(p.id, p.sport, p.name)}>
                        ✓ Als aktiv setzen
                      </button>
                    )}
                    <button onClick={() => deletePlan(p.id, p.name)} className="btn"
                      style={{ color: "var(--red)", borderColor: "rgba(255,90,107,0.25)", marginLeft: "auto" }}>
                      🗑
                    </button>
                  </div>
                </div>
              );
            })}
            </div>
          </>
        )
      ) : (
        <div className="stagger">
        {filteredTemplates.map((t) => {
          const sport = t.sport;
          return (
            <div key={t.id} className="card card-hover">
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{ fontSize: 36 }}>{SPORT_ICONS[sport]}</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 18, fontStyle: "italic", marginBottom: 4 }}>{t.name}</h3>
                  <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 10, lineHeight: 1.5 }}>
                    {t.description}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                    <span className="sport-pill" style={{
                      background: `${SPORT_COLORS[sport]}20`,
                      color: SPORT_COLORS[sport],
                      border: `1px solid ${SPORT_COLORS[sport]}40`,
                    }}>{SPORT_LABELS[sport]}</span>
                    <span className="sport-pill" style={{
                      background: "var(--surface)", color: "var(--text-dim)",
                      border: "1px solid var(--border)",
                    }}>{t.level}</span>
                    <span className="sport-pill" style={{
                      background: "var(--surface)", color: "var(--text-dim)",
                      border: "1px solid var(--border)",
                    }}>{t.durationWeeks} Wochen</span>
                  </div>
                </div>
              </div>
              <button onClick={() => cloneTemplate(t)} className="btn btn-primary btn-block" style={{ marginTop: 8 }}>
                + Als meinen Plan übernehmen
              </button>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, label, color }: any) {
  return (
    <button onClick={onClick} style={{
      padding: "7px 14px", borderRadius: 999,
      border: `1px solid ${active ? (color || "var(--accent)") : "var(--border)"}`,
      background: active ? (color ? `${color}20` : "var(--accent-tint)") : "var(--bg-raised)",
      color: active ? (color || "var(--accent)") : "var(--text-dim)",
      cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit",
    }}>{label}</button>
  );
}
