"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "violet" | "cyan" | "lime" | "purple" | "orange" | "rose" | "mono";
export type Surface =
  | "slate" | "black" | "blue" | "warm" | "forest" | "violet"
  | "stone" | "storm" | "sage" | "dust" | "mauve"
  | "snow" | "cream" | "mint" | "lavender" | "sand";

export type Tone = "dark" | "medium" | "light";

export const THEMES: { id: Theme; label: string; preview: string }[] = [
  { id: "violet", label: "Electric Violet", preview: "#7C5CFC" },
  { id: "cyan",   label: "Classic Cyan",    preview: "#22D3EE" },
  { id: "lime",   label: "Neon Lime",       preview: "#A3E635" },
  { id: "purple", label: "Royal Purple",    preview: "#A78BFA" },
  { id: "orange", label: "Sunset Orange",   preview: "#FB923C" },
  { id: "rose",   label: "Crimson Rose",    preview: "#F472B6" },
  { id: "mono",   label: "Monochrome",      preview: "#E5E7EB" },
];

export const SURFACES: { id: Surface; label: string; preview: string; tone: Tone }[] = [
  // Dunkel
  { id: "slate",    label: "Slate (Default)",    preview: "#0f1218", tone: "dark" },
  { id: "black",    label: "OLED Black",         preview: "#000000", tone: "dark" },
  { id: "blue",     label: "Deep Blue",          preview: "#0a1428", tone: "dark" },
  { id: "warm",     label: "Warm Charcoal",      preview: "#1a1612", tone: "dark" },
  { id: "forest",   label: "Forest Night",       preview: "#0a1812", tone: "dark" },
  { id: "violet",   label: "Midnight Violet",    preview: "#15101e", tone: "dark" },
  // Mittel
  { id: "stone",    label: "Stone",              preview: "#525762", tone: "medium" },
  { id: "storm",    label: "Storm",              preview: "#4a5868", tone: "medium" },
  { id: "sage",     label: "Sage",               preview: "#4f594a", tone: "medium" },
  { id: "dust",     label: "Dust",               preview: "#5c5044", tone: "medium" },
  { id: "mauve",    label: "Mauve",              preview: "#58495a", tone: "medium" },
  // Hell
  { id: "snow",     label: "Snow",               preview: "#ffffff", tone: "light" },
  { id: "cream",    label: "Cream",              preview: "#f8f3e9", tone: "light" },
  { id: "mint",     label: "Mint",               preview: "#eff7f1", tone: "light" },
  { id: "lavender", label: "Lavender",           preview: "#f3eef9", tone: "light" },
  { id: "sand",     label: "Sand",               preview: "#f5efe5", tone: "light" },
];

type Ctx = {
  theme: Theme; setTheme: (t: Theme) => void;
  surface: Surface; setSurface: (s: Surface) => void;
  customAccent: string | null;
  setCustomAccent: (hex: string | null) => void;
};
const ThemeCtx = createContext<Ctx>({
  theme: "violet", setTheme: () => {},
  surface: "slate", setSurface: () => {},
  customAccent: null, setCustomAccent: () => {},
});

export function useTheme() {
  return useContext(ThemeCtx);
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("violet");
  const [surface, setSurfaceState] = useState<Surface>("slate");
  const [customAccent, setCustomAccentState] = useState<string | null>(null);

  function applyCustomAccent(hex: string | null) {
    const root = document.documentElement;
    if (hex && /^#[0-9a-fA-F]{6}$/.test(hex)) {
      root.style.setProperty("--accent", hex);
      root.style.setProperty("--accent-glow", hex + "38");
      root.style.setProperty("--accent-tint",  hex + "1A");
      root.style.setProperty("--accent-border", hex + "59");
    } else {
      root.style.removeProperty("--accent");
      root.style.removeProperty("--accent-glow");
      root.style.removeProperty("--accent-tint");
      root.style.removeProperty("--accent-border");
    }
  }

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
    const ca = localStorage.getItem("kalion-accent");
    if (ca && /^#[0-9a-fA-F]{6}$/.test(ca)) {
      setCustomAccentState(ca);
      applyCustomAccent(ca);
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

  function setCustomAccent(hex: string | null) {
    setCustomAccentState(hex);
    if (hex) localStorage.setItem("kalion-accent", hex);
    else localStorage.removeItem("kalion-accent");
    applyCustomAccent(hex);
  }

  return (
    <ThemeCtx.Provider value={{ theme, setTheme, surface, setSurface, customAccent, setCustomAccent }}>
      {children}
    </ThemeCtx.Provider>
  );
}
