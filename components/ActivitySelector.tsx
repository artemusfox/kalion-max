"use client";

// Wiederverwendbarer Activity-Selector
// Zeigt alle Aktivitäten gruppiert nach Kategorie, mit Filter-Chips

import { useState, useMemo } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { ACTIVITIES, ACTIVITY_BY_ID, CATEGORY_LABELS_DE, CATEGORY_LABELS_EN, type Activity, type ActivityCategory } from "@/lib/activities";

type Props = {
  value: string | null;
  onChange: (id: string) => void;
  showFilters?: boolean;
  gpsOnly?: boolean; // nur Activities die GPS unterstützen
};

const FILTERS: ActivityCategory[] = ["run", "ride", "swim", "winter", "indoor", "walk", "other"];

export default function ActivitySelector({ value, onChange, showFilters = true, gpsOnly = false }: Props) {
  const { lang } = useLanguage();
  const [filter, setFilter] = useState<ActivityCategory | "all">("all");

  const list = useMemo(() => {
    let arr: Activity[] = [...ACTIVITIES];
    if (gpsOnly) arr = arr.filter((a) => a.gps);
    if (filter !== "all") arr = arr.filter((a) => a.category === filter);
    return arr;
  }, [filter, gpsOnly]);

  const catLabels = lang === "en" ? CATEGORY_LABELS_EN : CATEGORY_LABELS_DE;

  return (
    <div>
      {showFilters && (
        <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 12, paddingBottom: 4 }}>
          <button
            onClick={() => setFilter("all")}
            className="btn"
            style={{
              padding: "6px 12px", fontSize: 11, whiteSpace: "nowrap",
              background: filter === "all" ? "var(--accent-tint)" : "var(--bg-elevated)",
              borderColor: filter === "all" ? "var(--accent)" : "var(--border)",
              color: filter === "all" ? "var(--accent)" : "var(--text)",
            }}
          >
            {lang === "en" ? "All" : "Alle"} · {list.length}
          </button>
          {FILTERS.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className="btn"
              style={{
                padding: "6px 12px", fontSize: 11, whiteSpace: "nowrap",
                background: filter === cat ? "var(--accent-tint)" : "var(--bg-elevated)",
                borderColor: filter === cat ? "var(--accent)" : "var(--border)",
                color: filter === cat ? "var(--accent)" : "var(--text)",
              }}
            >
              {catLabels[cat]}
            </button>
          ))}
        </div>
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
        gap: 8,
      }}>
        {list.map((a) => {
          const active = value === a.id;
          return (
            <button
              key={a.id}
              onClick={() => onChange(a.id)}
              className="card"
              style={{
                padding: "12px 8px", textAlign: "center",
                background: active ? "var(--accent-tint)" : "var(--bg-elevated)",
                border: `2px solid ${active ? "var(--accent)" : "var(--border)"}`,
                cursor: "pointer", fontFamily: "inherit",
                transform: active ? "scale(1.03)" : "scale(1)",
                transition: "all 0.15s",
                margin: 0,
                position: "relative",
              }}
            >
              <div style={{ fontSize: 24, lineHeight: 1.2 }}>{a.icon}</div>
              <div style={{
                fontSize: 11, fontWeight: 700, marginTop: 4,
                color: active ? "var(--accent)" : "var(--text)",
                lineHeight: 1.2,
              }}>
                {lang === "en" ? a.label_en : a.label_de}
              </div>
              {a.gps && (
                <div style={{
                  position: "absolute", top: 4, right: 4,
                  fontSize: 9, color: active ? "var(--accent)" : "var(--text-muted)",
                  fontWeight: 800, letterSpacing: 0.5,
                }} title={lang === "en" ? "GPS-trackable" : "GPS-fähig"}>
                  GPS
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Kleiner inline-Anzeige-Helper (zeigt nur Icon + Name kompakt)
export function ActivityBadge({ id }: { id: string }) {
  const { lang } = useLanguage();
  const a = ACTIVITY_BY_ID[id];
  if (!a) return null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "3px 10px", borderRadius: 999,
      background: "var(--accent-tint)", border: "1px solid var(--accent-border)",
      fontSize: 11, fontWeight: 700, color: "var(--accent)",
    }}>
      <span>{a.icon}</span>
      <span>{lang === "en" ? a.label_en : a.label_de}</span>
    </span>
  );
}
