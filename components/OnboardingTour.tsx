"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

const STORAGE_KEY = "kalion-onboarded";

type Step = {
  selector: string;          // data-tour="..." Selector
  title: { de: string; en: string };
  body:  { de: string; en: string };
  align?: "top" | "bottom";  // wo der Tooltip relativ zum Element steht
};

const STEPS: Step[] = [
  {
    selector: '[data-tour="hero"]',
    title: { de: "Willkommen bei KALION MAX",                       en: "Welcome to KALION MAX" },
    body:  { de: "Hier ist dein Dashboard — alle Module auf einen Blick. Du kannst sie sortieren und ausblenden.",
             en: "Here's your dashboard — all modules at a glance. You can sort and hide them." },
    align: "bottom",
  },
  {
    selector: '[data-tour="active-plan"]',
    title: { de: "Aktiver Plan",                                    en: "Active plan" },
    body:  { de: "Wähle einen Plan oder klone eine Vorlage. Von hier startest du dein Training.",
             en: "Pick a plan or clone a template. Start your training from here." },
    align: "bottom",
  },
  {
    selector: '[data-tour="habits"]',
    title: { de: "Habits & Routinen",                               en: "Habits & routines" },
    body:  { de: "Tägliche Gewohnheiten, Morgen- und Abend-Routinen — kleine Schritte, große Wirkung.",
             en: "Daily habits, morning and evening routines — small steps, big impact." },
    align: "top",
  },
  {
    selector: '[data-tour="nav"]',
    title: { de: "Navigation",                                      en: "Navigation" },
    body:  { de: "Pläne, Stats, Körper, Nutrition, Listen — alles über die Top-Nav. Settings rechts oben.",
             en: "Plans, stats, body, nutrition, lists — all in the top nav. Settings up right." },
    align: "bottom",
  },
];

export default function OnboardingTour() {
  const { lang } = useLanguage();
  const [stepIdx, setStepIdx] = useState(-1); // -1 = nicht aktiv
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY) === "1") return;
    // Kleiner Delay damit die Page erst rendert
    const t = setTimeout(() => setStepIdx(0), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (stepIdx < 0 || stepIdx >= STEPS.length) return;
    const sel = STEPS[stepIdx].selector;
    function update() {
      const el = document.querySelector(sel) as HTMLElement | null;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // Nach Scroll kurz warten, dann RECT lesen
        setTimeout(() => setRect(el.getBoundingClientRect()), 400);
      } else {
        setRect(null);
      }
    }
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [stepIdx]);

  function next() {
    if (stepIdx + 1 >= STEPS.length) finish();
    else setStepIdx(stepIdx + 1);
  }
  function prev() { if (stepIdx > 0) setStepIdx(stepIdx - 1); }
  function finish() {
    localStorage.setItem(STORAGE_KEY, "1");
    setStepIdx(-1);
  }

  if (stepIdx < 0 || !rect) return null;

  const step = STEPS[stepIdx];
  const padding = 12;
  const holeX = rect.left - padding;
  const holeY = rect.top - padding;
  const holeW = rect.width + padding * 2;
  const holeH = rect.height + padding * 2;

  // Tooltip-Position
  const tooltipTop = step.align === "top"
    ? Math.max(20, holeY - 200)
    : Math.min(window.innerHeight - 200, holeY + holeH + 16);
  const tooltipLeft = Math.max(20, Math.min(window.innerWidth - 340, rect.left + rect.width / 2 - 160));

  return (
    <>
      {/* Overlay mit "Loch" via SVG-mask */}
      <svg
        style={{
          position: "fixed", inset: 0, zIndex: 9990,
          pointerEvents: "none",
        }}
        width="100%"
        height="100%"
      >
        <defs>
          <mask id="kalion-tour-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={holeX} y={holeY}
              width={holeW} height={holeH}
              rx={14}
              fill="black"
            />
          </mask>
        </defs>
        <rect
          width="100%" height="100%"
          fill="rgba(0,0,0,0.7)"
          mask="url(#kalion-tour-mask)"
          style={{
            transition: "all 350ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
        {/* Akzent-Border um's Loch */}
        <rect
          x={holeX} y={holeY}
          width={holeW} height={holeH}
          rx={14}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={2}
          style={{
            filter: "drop-shadow(0 0 12px var(--accent-glow))",
            transition: "all 350ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      </svg>

      {/* Tooltip */}
      <div
        className="kalion-glass"
        style={{
          position: "fixed",
          top: tooltipTop, left: tooltipLeft,
          width: 320,
          padding: 16,
          zIndex: 9999,
          animation: "kalion-page-in 350ms var(--ease-out) both",
        }}
      >
        <div style={{
          fontSize: 9, color: "var(--text-muted)", letterSpacing: 1.5,
          fontWeight: 800, textTransform: "uppercase", marginBottom: 6,
        }}>
          {stepIdx + 1} / {STEPS.length}
        </div>
        <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>
          {step.title[lang]}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.5, marginBottom: 14 }}>
          {step.body[lang]}
        </div>
        <div style={{ display: "flex", gap: 6, justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={finish} className="btn btn-ghost" style={{ fontSize: 11, padding: "6px 10px" }}>
            {lang === "en" ? "Skip" : "Überspringen"}
          </button>
          <div style={{ display: "flex", gap: 6 }}>
            {stepIdx > 0 && (
              <button onClick={prev} className="btn" style={{ fontSize: 11, padding: "6px 12px" }}>
                ←
              </button>
            )}
            <button onClick={next} className="btn btn-primary" style={{ fontSize: 11, padding: "6px 14px" }}>
              {stepIdx + 1 === STEPS.length
                ? (lang === "en" ? "Got it ✓" : "Verstanden ✓")
                : (lang === "en" ? "Next →" : "Weiter →")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
