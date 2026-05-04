"use client";

import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import LegalFooter from "@/components/LegalFooter";
import LanguageSwitch from "@/components/LanguageSwitch";
import UserStats from "@/components/UserStats";
import UserGeoMap from "@/components/UserGeoMap";
import ActivityFeed from "@/components/ActivityFeed";
import { useLanguage } from "@/components/LanguageProvider";

export default function HomeHero() {
  const { t } = useLanguage();

  const sports: { icon: string; key: "sport.strength" | "sport.calisthenics" | "sport.cardio" | "sport.hiit" | "sport.mobility"; color: string }[] = [
    { icon: "🏋️", key: "sport.strength",     color: "#FF5A6B" },
    { icon: "💪", key: "sport.calisthenics", color: "#2DD4BF" },
    { icon: "🏃", key: "sport.cardio",       color: "#60A5FA" },
    { icon: "🔥", key: "sport.hiit",         color: "#FFB800" },
    { icon: "🧘", key: "sport.mobility",     color: "#8B7FF0" },
  ];

  const features: {
    icon: string;
    titleKey: "home.feat.plans.title" | "home.feat.tracking.title" | "home.feat.progress.title" | "home.feat.body.title";
    descKey:  "home.feat.plans.desc"  | "home.feat.tracking.desc"  | "home.feat.progress.desc"  | "home.feat.body.desc";
  }[] = [
    { icon: "📋", titleKey: "home.feat.plans.title",    descKey: "home.feat.plans.desc" },
    { icon: "🎯", titleKey: "home.feat.tracking.title", descKey: "home.feat.tracking.desc" },
    { icon: "📊", titleKey: "home.feat.progress.title", descKey: "home.feat.progress.desc" },
    { icon: "📏", titleKey: "home.feat.body.title",     descKey: "home.feat.body.desc" },
  ];

  return (
    <div className="auth-wrap">
      <div style={{ maxWidth: 720, textAlign: "center", width: "100%" }}>
        {/* Sprach-Umschalter + Live-Counter oben */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
          <UserStats />
          <LanguageSwitch />
        </div>

        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <BrandLogo size={120} textSize={56} />
          </div>
          <p
            style={{ fontSize: 19, color: "var(--text-dim)", maxWidth: 520, margin: "0 auto", lineHeight: 1.5 }}
            dangerouslySetInnerHTML={{ __html: t("home.tagline.html").replace("<strong>", '<strong style="color:var(--text)">') }}
          />
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
          <Link href="/auth/signup" className="btn btn-primary" style={{ padding: "18px 36px", fontSize: 15 }}>
            {t("home.cta.signup")}
          </Link>
          <Link href="/auth/login" className="btn" style={{ padding: "18px 36px", fontSize: 15 }}>
            {t("home.cta.login")}
          </Link>
        </div>

        {/* Sports grid */}
        <div style={{ marginBottom: 40 }}>
          <div style={{
            fontSize: 11, color: "var(--text-muted)", letterSpacing: 3,
            textTransform: "uppercase", fontWeight: 800, marginBottom: 16,
          }}>{t("home.sports.heading")}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
            {sports.map((s, i) => (
              <div key={i} className="card" style={{
                padding: 20, marginBottom: 0, textAlign: "center",
                borderTop: `3px solid ${s.color}`,
              }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 800 }}>{t(s.key)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          {features.map((f, i) => (
            <div key={i} className="card" style={{ padding: 22, marginBottom: 0, textAlign: "left" }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 6 }}>{t(f.titleKey)}</div>
              <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.5 }}>{t(f.descKey)}</div>
            </div>
          ))}
        </div>

        {/* Live Community Activity */}
        <div className="card" style={{ marginTop: 32, textAlign: "left" }}>
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6, textAlign: "center" }}>
            🌍 {lang === "en" ? "Live community activity" : "Live-Community-Aktivität"}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 14, textAlign: "center" }}>
            {lang === "en" ? "Real users, right now" : "Echte User, in Echtzeit"}
          </div>
          <ActivityFeed compact />
        </div>

        {/* Geo-Heatmap Teaser */}
        <div className="card" style={{ textAlign: "left" }}>
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6, textAlign: "center" }}>
            🌍 {t("home.sports.heading") /* placeholder until i18n key */}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 14, textAlign: "center" }}>
            Athletes from around the world · Athleten aus aller Welt
          </div>
          <UserGeoMap compact />
        </div>

        <LegalFooter />
      </div>
    </div>
  );
}
