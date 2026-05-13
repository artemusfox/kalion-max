"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { useToast } from "@/components/Toast";
import BrandLogo from "@/components/BrandLogo";
import { useLanguage } from "@/components/LanguageProvider";
import UserStats from "@/components/UserStats";
import UserAvatar from "@/components/UserAvatar";

export default function AppNav({
  userName, isAdmin, avatarUrl,
}: {
  userName?: string | null;
  isAdmin?: boolean | null;
  avatarUrl?: string | null;
} = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast(t("auth.bye.toast"), { type: "info" });
    router.push("/");
    router.refresh();
  }

  const links = [
    { href: "/dashboard",           tk: "nav.home" as const },
    { href: "/dashboard/plans",     tk: "nav.plans" as const },
    { href: "/dashboard/training",  tk: "nav.training" as const },
    { href: "/dashboard/cardio",    tk: "nav.cardio" as const },
    { href: "/dashboard/progress",  tk: "nav.stats" as const },
    { href: "/dashboard/body",      tk: "nav.body" as const },
    { href: "/dashboard/nutrition", tk: "nav.nutrition" as const },
    { href: "/dashboard/goals",     tk: "nav.goals" as const },
    { href: "/dashboard/todos",     tk: "nav.todos" as const },
  ];

  return (
    <div className="app-nav" data-tour="nav">
      <Link href="/dashboard" style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: 10 }}>
        <UserAvatar avatarUrl={avatarUrl} displayName={userName} size={30} ring />
        <BrandLogo size={28} textSize={16} withText={false} />
        <div className="brand" style={{ fontSize: 16, lineHeight: 1, display: "flex", alignItems: "baseline" }}>
          <span className="brand-kalion">KALION</span>
          <span className="brand-max" style={{ marginLeft: 4 }}>MAX</span>
        </div>
      </Link>

      <div className="app-nav-links">
        {links.map((l) => (
          <Link key={l.href} href={l.href}
            className={`app-nav-link ${pathname === l.href ? "active" : ""}`}>
            {t(l.tk)}
          </Link>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <UserStats compact />
        {isAdmin && (
          <Link href="/dashboard/admin" className="btn btn-ghost" style={{
            padding: "6px 10px", fontSize: 11, fontWeight: 800,
            border: "1px solid var(--accent-border)", color: "var(--accent)",
          }}>🛡️ {t("nav.admin")}</Link>
        )}
        <Link href="/dashboard/settings" className="btn btn-ghost" style={{ padding: "8px 12px" }}>⚙️</Link>
        <button onClick={handleLogout} className="btn btn-ghost" style={{ padding: "8px 12px", fontSize: 12 }}>
          {t("nav.logout")}
        </button>
      </div>
    </div>
  );
}
