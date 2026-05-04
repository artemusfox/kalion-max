"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";
import { useLanguage } from "@/components/LanguageProvider";
import {
  canNativeShare, nativeShare,
  whatsappUrl, downloadImage, twitterUrl, telegramUrl,
} from "@/lib/share";
import { renderWorkoutCard, type WorkoutCard } from "@/lib/share-card";

type Props = {
  card: WorkoutCard;
  shareUrl?: string;     // optionaler Link den man mitschickt
  buttonLabel?: string;
  buttonStyle?: React.CSSProperties;
};

export default function ShareButton({ card, shareUrl, buttonLabel, buttonStyle }: Props) {
  const { toast } = useToast();
  const { lang } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  async function preview() {
    setBusy(true);
    try {
      const blob = await renderWorkoutCard(card);
      setImageBlob(blob);
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      setImageUrl(URL.createObjectURL(blob));
      setOpen(true);
    } catch (e) {
      toast(lang === "en" ? "Could not generate image" : "Bild konnte nicht erzeugt werden", { type: "error" });
    } finally {
      setBusy(false);
    }
  }

  function close() {
    setOpen(false);
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
      setImageUrl(null);
    }
    setImageBlob(null);
  }

  async function shareNative() {
    if (!imageBlob) return;
    const ok = await nativeShare({
      title: card.title,
      text: card.subtitle || card.title,
      url: shareUrl,
      imageBlob,
      imageFilename: `kalion-${card.date.toISOString().slice(0, 10)}.png`,
    });
    if (ok) {
      toast(lang === "en" ? "Shared!" : "Geteilt!", { type: "success", icon: "📤" });
      close();
    }
  }

  function openWhatsApp() {
    const text = `${card.title} — ${card.subtitle || ""}`.trim();
    window.open(whatsappUrl(text, shareUrl), "_blank", "noopener");
  }

  function openTwitter() {
    const text = `${card.title}${card.subtitle ? ` — ${card.subtitle}` : ""} #kalionmax`;
    window.open(twitterUrl(text, shareUrl), "_blank", "noopener");
  }

  function openTelegram() {
    const text = `${card.title}${card.subtitle ? ` — ${card.subtitle}` : ""}`;
    window.open(telegramUrl(text, shareUrl), "_blank", "noopener");
  }

  function downloadForInsta() {
    if (!imageBlob) return;
    downloadImage(imageBlob, `kalion-${card.date.toISOString().slice(0, 10)}.png`);
    toast(
      lang === "en"
        ? "Image saved — open Instagram → Story → upload from gallery"
        : "Bild gespeichert — Instagram → Story → aus Galerie hochladen",
      { type: "success", icon: "📸" }
    );
  }

  function downloadForTikTok() {
    if (!imageBlob) return;
    downloadImage(imageBlob, `kalion-${card.date.toISOString().slice(0, 10)}.png`);
    toast(
      lang === "en"
        ? "Image saved — open TikTok → Story → upload from gallery"
        : "Bild gespeichert — TikTok → Story → aus Galerie hochladen",
      { type: "success", icon: "📸" }
    );
  }

  return (
    <>
      <button
        onClick={preview}
        disabled={busy}
        className="btn"
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          ...buttonStyle,
        }}
      >
        {busy ? <div className="spinner" /> : <>📤 {buttonLabel || (lang === "en" ? "Share" : "Teilen")}</>}
      </button>

      {open && imageUrl && (
        <div
          onClick={close}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.85)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20, animation: "kalion-fade-in 0.2s ease-out",
          }}
        >
          <style>{`
            @keyframes kalion-fade-in { from { opacity: 0; } to { opacity: 1; } }
          `}</style>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--bg-raised)",
              borderRadius: 20, border: "1px solid var(--border)",
              padding: 18, maxWidth: 480, width: "100%",
              maxHeight: "92vh", overflowY: "auto",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontWeight: 800, fontSize: 14 }}>
                {lang === "en" ? "Share" : "Teilen"}
              </div>
              <button onClick={close} className="btn btn-ghost" style={{ padding: "4px 10px" }}>✕</button>
            </div>

            {/* Vorschau */}
            <div style={{
              marginBottom: 16,
              borderRadius: 12, overflow: "hidden",
              border: "1px solid var(--border)",
              background: "#000",
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Share preview"
                style={{ width: "100%", display: "block", aspectRatio: "9/16", objectFit: "contain" }}
              />
            </div>

            {/* Native (mobile) — beste Option wenn verfügbar */}
            {canNativeShare(true) && (
              <button
                onClick={shareNative}
                className="btn btn-primary btn-block"
                style={{ marginBottom: 10 }}
              >
                📤 {lang === "en" ? "Open share menu" : "Teilen-Menü öffnen"}
              </button>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
              <button onClick={openWhatsApp} className="btn" style={{ background: "#25D36620", color: "#25D366", borderColor: "#25D36640" }}>
                💬 WhatsApp
              </button>
              <button onClick={downloadForInsta} className="btn" style={{ background: "linear-gradient(135deg, #F58529, #DD2A7B, #8134AF)", color: "white", border: "none" }}>
                📸 Instagram
              </button>
              <button onClick={downloadForTikTok} className="btn" style={{ background: "#00000020", color: "var(--text)", borderColor: "var(--border)" }}>
                🎵 TikTok
              </button>
              <button onClick={openTwitter} className="btn">
                𝕏 Twitter
              </button>
              <button onClick={openTelegram} className="btn">
                ✈ Telegram
              </button>
              <button onClick={() => imageBlob && downloadImage(imageBlob, `kalion-${card.date.toISOString().slice(0, 10)}.png`)} className="btn">
                ⬇️ {lang === "en" ? "Save image" : "Bild speichern"}
              </button>
            </div>

            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 12, lineHeight: 1.5 }}>
              {lang === "en"
                ? "Instagram & TikTok don't allow direct posting from the web. The image will download — open the app and upload it from your gallery."
                : "Instagram & TikTok erlauben keinen direkten Web-Upload. Das Bild wird gespeichert — öffne dann die App und lade es aus deiner Galerie hoch."}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
