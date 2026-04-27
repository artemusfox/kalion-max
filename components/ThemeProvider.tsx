"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "cyan" | "lime" | "purple" | "orange" | "rose" | "mono";
export type Surface =
  | "slate" | "black" | "blue" | "warm" | "forest" | "violet"
  | "snow" | "cream" | "mint" | "lavender" | "sand";

export const THEMES: { id: Theme; label: string; preview: string }[] = [
  { id: "cyan",   label: "Electric Cyan",  preview: "#22D3EE" },
  { id: "lime",   label: "Neon Lime",      preview: "#A3E635" },
  { id: "purple", label: "Royal Purple",   preview: "#A78BFA" },
  { id: "orange", label: "Sunset Orange",  preview: "#FB923C" },
  { id: "rose",   label: "Crimson Rose",   preview: "#F472B6" },
  { id: "mono",   label: "Monochrome",     preview: "#E5E7EB" },
];

export const SURFACES: { id: Surface; label: string; preview: string; light: boolean }[] = [
  // Dunkel
  { id: "slate",    label: "Slate (Default)",    preview: "#0f1218", light: false },
  { id: "black",    label: "OLED Black",         preview: "#000000", light: false },
  { id: "blue",     label: "Deep Blue",          preview: "#0a1428", light: false },
  { id: "warm",     label: "Warm Charcoal",      preview: "#1a1612", light: false },
  { id: "forest",   label: "Forest Night",       preview: "#0a1812", light: false },
  { id: "violet",   label: "Midnight Violet",    preview: "#15101e", light: false },
  // Hell
  { id: "snow",     label: "Snow",               preview: "#ffffff", light: true },
  { id: "cream",    label: "Cream",              preview: "#f8f3e9", light: true },
  { id: "mint",     label: "Mint",               preview: "#eff7f1", light: true },
  { id: "lavender", label: "Lavender",           preview: "#f3eef9", light: true },
  { id: "sand",     label: "Sand",               preview: "#f5efe5", light: true },
];

type Ctx = {
  theme: Theme; setTheme: (t: Theme) => void;
  surface: Surface; setSurface: (s: Surface) => void;
};
const ThemeCtx = createContext<Ctx>({
  theme: "cyan", setTheme: () => {},
  surface: "slate", setSurface: () => {},
});

export function useTheme() {
  return useContext(ThemeCtx);
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("cyan");
  const [surface, setSurfaceState] = useState<Surface>("slate");

  // Initial Werte aus localStorage lesen
  useEffect(() => {
    const t = localStorage.getItem("kalion-theme") as Theme | null;
    if (t && THEMES.some((x) => x.id === t)) {
      setThemeState(t);
      document.documentElement.setAttribute("data-theme", t);
    }
    const s = localStorage.getItem("kalion-surface") as Surface | null;
    if (s && SURFACES.some((x) => x.id === s)) {
      setSurfaceState(s);
      document.documentElement.setAttribute("data-bg", s);
    }
  }, []);

  function setTheme(t: Theme) {
    setThemeState(t);
    localStorage.setItem("kalion-theme", t);
    document.documentElement.setAttribute("data-theme", t);
  }

  function setSurface(s: Surface) {
    setSurfaceState(s);
    localStorage.setItem("kalion-surface", s);
    document.documentElement.setAttribute("data-bg", s);
  }

  return (
    <ThemeCtx.Provider value={{ theme, setTheme, surface, setSurface }}>
      {children}
    </ThemeCtx.Provider>
  );
}
