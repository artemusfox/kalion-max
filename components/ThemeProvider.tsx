"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "cyan" | "lime" | "purple" | "orange" | "rose" | "mono";

export const THEMES: { id: Theme; label: string; preview: string }[] = [
  { id: "cyan",   label: "Electric Cyan",  preview: "#22D3EE" },
  { id: "lime",   label: "Neon Lime",      preview: "#A3E635" },
  { id: "purple", label: "Royal Purple",   preview: "#A78BFA" },
  { id: "orange", label: "Sunset Orange",  preview: "#FB923C" },
  { id: "rose",   label: "Crimson Rose",   preview: "#F472B6" },
  { id: "mono",   label: "Monochrome",     preview: "#E5E7EB" },
];

type Ctx = { theme: Theme; setTheme: (t: Theme) => void };
const ThemeCtx = createContext<Ctx>({ theme: "cyan", setTheme: () => {} });

export function useTheme() {
  return useContext(ThemeCtx);
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("cyan");

  // Initial Theme aus localStorage lesen
  useEffect(() => {
    const stored = localStorage.getItem("kalion-theme") as Theme | null;
    if (stored && THEMES.some((t) => t.id === stored)) {
      setThemeState(stored);
      document.documentElement.setAttribute("data-theme", stored);
    }
  }, []);

  function setTheme(t: Theme) {
    setThemeState(t);
    localStorage.setItem("kalion-theme", t);
    document.documentElement.setAttribute("data-theme", t);
  }

  return <ThemeCtx.Provider value={{ theme, setTheme }}>{children}</ThemeCtx.Provider>;
}
