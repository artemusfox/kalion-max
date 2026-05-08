"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// Wrapper der den Inhalt bei Routen-Wechsel neu mountet → CSS-Animation re-triggert.
// Cross-Fade + leichter Slide-Up via `kalion-page-transition`-Class in globals.css.
export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="kalion-page-transition">
      {children}
    </div>
  );
}
