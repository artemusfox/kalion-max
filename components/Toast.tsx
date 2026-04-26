"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";

type ToastType = "success" | "error" | "info" | "warning";

type Toast = {
  id: string;
  type: ToastType;
  message: string;
  icon?: string;
};

type ToastContextValue = {
  toast: (message: string, options?: { type?: ToastType; icon?: string }) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, options: { type?: ToastType; icon?: string } = {}) => {
    const id = Math.random().toString(36).slice(2);
    const newToast: Toast = {
      id,
      type: options.type || "success",
      message,
      icon: options.icon,
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div style={{
        position: "fixed", top: "max(20px, env(safe-area-inset-top))", 
        left: "50%", transform: "translateX(-50%)",
        zIndex: 9999, display: "flex", flexDirection: "column",
        gap: 10, pointerEvents: "none", width: "calc(100% - 40px)",
        maxWidth: 440,
      }}>
        {toasts.map((t) => <ToastItem key={t.id} toast={t} />)}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast }: { toast: Toast }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const colors = {
    success: { bg: "var(--accent-tint)",  border: "var(--accent-border)",  text: "var(--accent)",  icon: "✓" },
    error:   { bg: "rgba(255,90,107,0.12)", border: "rgba(255,90,107,0.4)", text: "var(--red)",      icon: "✕" },
    warning: { bg: "rgba(255,184,0,0.12)",  border: "rgba(255,184,0,0.4)",   text: "var(--amber)",  icon: "⚠" },
    info:    { bg: "rgba(96,165,250,0.12)", border: "rgba(96,165,250,0.4)",  text: "var(--blue)",   icon: "ℹ" },
  }[toast.type];

  return (
    <div style={{
      background: "var(--bg-elevated)",
      border: `1px solid ${colors.border}`,
      borderRadius: 14,
      padding: "12px 18px",
      boxShadow: "var(--shadow-lg)",
      display: "flex", alignItems: "center", gap: 12,
      transform: mounted ? "translateY(0)" : "translateY(-20px)",
      opacity: mounted ? 1 : 0,
      transition: "transform 0.35s cubic-bezier(.34,1.56,.64,1), opacity 0.25s",
      pointerEvents: "auto",
      minHeight: 48,
      width: "100%",
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 10,
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: colors.text, fontSize: 16, fontWeight: 800,
        flexShrink: 0,
      }}>{toast.icon || colors.icon}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", flex: 1 }}>
        {toast.message}
      </div>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback: console + window alert — damit nichts kaputt geht, falls der Provider fehlt
    return {
      toast: (msg: string) => { console.log("[Toast]", msg); },
    };
  }
  return ctx;
}
