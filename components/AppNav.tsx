"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { useToast } from "@/components/Toast";

export default function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast("Bis bald! 👋", { type: "info" });
    router.push("/");
    router.refresh();
  }

  const links = [
    { href: "/dashboard", label: "Home" },
    { href: "/dashboard/plans", label: "Pläne" },
    { href: "/dashboard/training", label: "Training" },
    { href: "/dashboard/progress", label: "Stats" },
    { href: "/dashboard/body", label: "Körper" },
    { href: "/dashboard/nutrition", label: "Nutrition" },
    { href: "/dashboard/goals", label: "Ziele" },
  ];

  return (
    <div className="app-nav">
      <Link href="/dashboard" style={{ textDecoration: "none" }}>
        <div className="brand" style={{ fontSize: 20 }}>
          <span className="brand-kalion">KALION</span>
          <span className="brand-bolt">⚡</span>
          <span className="brand-max">MAX</span>
        </div>
      </Link>

      <div className="app-nav-links">
        {links.map((l) => (
          <Link key={l.href} href={l.href}
            className={`app-nav-link ${pathname === l.href ? "active" : ""}`}>
            {l.label}
          </Link>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <Link href="/dashboard/settings" className="btn btn-ghost" style={{ padding: "8px 12px" }}>⚙️</Link>
        <button onClick={handleLogout} className="btn btn-ghost" style={{ padding: "8px 12px", fontSize: 12 }}>
          Logout
        </button>
      </div>
    </div>
  );
}
