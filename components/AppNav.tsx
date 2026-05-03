"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { useToast } from "@/components/Toast";
import BrandLogo from "@/components/BrandLogo";
import { useLanguage } from "@/components/LanguageProvider";

export default function AppNav({ userName, isAdmin }: { userName?: string | null; isAdmin?: boolean | null } = {}) {
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
    { href: "/dashboard/progress",  tk: "nav.stats" as const },
    { href: "/dashboard/body",      tk: "nav.body" as const },
    { href: "/dashboard/nutrition", tk: "nav.nutrition" as const },
    { href: "/dashboard/goals",     tk: "nav.goals" as const },
  ];

  return (
    <div className="app-nav">
      <Link href="/dashboard" style={{ textDecoration: "none", color: "inherit" }}>
        <BrandLogo size={30} textSize={18} />
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
