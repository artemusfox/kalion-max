"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { useToast } from "@/components/Toast";
import { useLanguage } from "@/components/LanguageProvider";
import { AVATAR_PRESETS } from "@/lib/avatars";
import { deleteOldAvatar } from "@/lib/avatar-storage";
import { isPro } from "@/lib/premium";
import UserAvatar from "@/components/UserAvatar";
import AvatarCropper from "@/components/AvatarCropper";
import PaywallModal from "@/components/PaywallModal";

type Props = {
  currentUrl?: string | null;
  displayName?: string | null;
  onClose: () => void;
  onChange: (newUrl: string | null) => void;
};

export default function AvatarPicker({ currentUrl, displayName, onClose, onChange }: Props) {
  const { lang } = useLanguage();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<"preset" | "upload">("preset");
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [proStatus, setProStatus] = useState<boolean | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  // Pro-Status laden
  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from("profiles")
        .select("subscription_tier, subscription_status, subscription_period_end")
        .single();
      setProStatus(isPro(data));
    })();
  }, []);

  async function setPreset(presetId: string) {
    setBusy(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBusy(false); return; }
    // Alten Storage-File löschen falls vorhanden
    await deleteOldAvatar(supabase, currentUrl);
    const newUrl = `preset:${presetId}`;
    const { error } = await supabase.from("profiles").update({ avatar_url: newUrl }).eq("id", user.id);
    setBusy(false);
    if (error) { toast(error.message, { type: "error" }); return; }
    onChange(newUrl);
    toast(lang === "en" ? "Avatar updated ✓" : "Avatar geändert ✓", { type: "success", icon: "✓" });
    onClose();
  }

  function pickFile(f: File) {
    if (!f.type.startsWith("image/")) {
      toast(lang === "en" ? "Please select an image" : "Bitte ein Bild wählen", { type: "error" });
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast(lang === "en" ? "Max 10 MB" : "Max 10 MB", { type: "error" });
      return;
    }
    // Cropper öffnen statt direkt hochladen
    setCropFile(f);
  }

  async function uploadCropped(blob: Blob) {
    setCropFile(null);
    setBusy(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBusy(false); return; }
    const path = `${user.id}/avatar-${Date.now()}.jpg`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, blob, {
      cacheControl: "3600", upsert: true, contentType: "image/jpeg",
    });
    if (upErr) { setBusy(false); toast(upErr.message, { type: "error" }); return; }
    // Alten File löschen NACH erfolgreichem Upload
    await deleteOldAvatar(supabase, currentUrl);
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    const { error: updErr } = await supabase.from("profiles").update({ avatar_url: pub.publicUrl }).eq("id", user.id);
    setBusy(false);
    if (updErr) { toast(updErr.message, { type: "error" }); return; }
    onChange(pub.publicUrl);
    toast(lang === "en" ? "Photo uploaded ✓" : "Foto hochgeladen ✓", { type: "success", icon: "📸" });
    onClose();
  }

  async function reset() {
    setBusy(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBusy(false); return; }
    await deleteOldAvatar(supabase, currentUrl);
    await supabase.from("profiles").update({ avatar_url: null }).eq("id", user.id);
    setBusy(false);
    onChange(null);
    onClose();
  }

  return (
    <div
      onClick={onClose}
      className="kalion-glass-backdrop"
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        padding: 20,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card kalion-glass"
        style={{
          maxWidth: 480, width: "100%", maxHeight: "90vh", overflowY: "auto",
          margin: 0, padding: 20,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>
            {lang === "en" ? "Choose your avatar" : "Avatar wählen"}
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: "4px 10px" }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex", gap: 4, padding: 4,
          background: "var(--bg-raised)", border: "1px solid var(--border)",
          borderRadius: 12, marginBottom: 14,
        }}>
          <button onClick={() => setTab("preset")} style={tabBtn(tab === "preset")}>
            🎨 {lang === "en" ? "Presets" : "Vorlagen"}
          </button>
          <button onClick={() => setTab("upload")} style={tabBtn(tab === "upload")}>
            📸 {lang === "en" ? "Photo" : "Foto"} {!proStatus && "💎"}
          </button>
        </div>

        {tab === "preset" && (
          <div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(70px, 1fr))",
              gap: 10,
            }}>
              {AVATAR_PRESETS.map((p) => {
                const active = currentUrl === `preset:${p.id}`;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPreset(p.id)}
                    disabled={busy}
                    title={p.label}
                    style={{
                      padding: 6, borderRadius: 14, cursor: "pointer",
                      background: active ? "var(--accent-tint)" : "transparent",
                      border: `2px solid ${active ? "var(--accent)" : "var(--border)"}`,
                      display: "flex", flexDirection: "column",
                      alignItems: "center", gap: 4,
                      transform: active ? "scale(1.05)" : "scale(1)",
                      transition: "all 0.15s",
                    }}
                  >
                    <UserAvatar
                      avatarUrl={`preset:${p.id}`}
                      size={50}
                    />
                    <span style={{
                      fontSize: 9, color: "var(--text-muted)",
                      fontWeight: 700, letterSpacing: 0.5,
                    }}>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {tab === "upload" && (
          proStatus === false ? (
            // FREE → Premium-Gate
            <div style={{
              padding: 24, textAlign: "center",
              background: "linear-gradient(135deg, var(--accent-tint), var(--bg-elevated))",
              border: "1px solid var(--accent-border)", borderRadius: 14,
            }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>💎</div>
              <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>
                {lang === "en" ? "Pro feature" : "Pro-Feature"}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 16, lineHeight: 1.5 }}>
                {lang === "en"
                  ? "Upload your own photo as avatar with the Pro plan. Free users have 20 fitness presets."
                  : "Eigenes Foto als Avatar nur mit Pro. Free-User haben 20 Fitness-Vorlagen."}
              </div>
              <button onClick={() => setShowPaywall(true)} className="btn btn-primary btn-block">
                {lang === "en" ? "Upgrade to Pro →" : "Auf Pro upgraden →"}
              </button>
              <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} feature="Avatar Upload" />
            </div>
          ) : (
            <div>
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
                padding: 20, background: "var(--bg-elevated)",
                border: "1px dashed var(--border-strong)", borderRadius: 14,
                textAlign: "center",
              }}>
                <UserAvatar avatarUrl={currentUrl} displayName={displayName} size={80} />
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => { if (e.target.files?.[0]) pickFile(e.target.files[0]); }}
                />
                <button
                  onClick={() => fileInput.current?.click()}
                  disabled={busy}
                  className="btn btn-primary btn-block"
                >
                  {busy ? <div className="spinner" /> : (lang === "en" ? "📤 Choose photo" : "📤 Foto wählen")}
                </button>
                <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>
                  {lang === "en"
                    ? "JPG or PNG, max 10 MB. You can crop after selecting."
                    : "JPG oder PNG, max 10 MB. Zuschneiden geht danach."}
                </div>
              </div>
            </div>
          )
        )}

        <button
          onClick={reset}
          disabled={busy || !currentUrl}
          className="btn btn-ghost btn-block"
          style={{ marginTop: 14, fontSize: 12, color: currentUrl ? "var(--red)" : "var(--text-muted)" }}
        >
          {lang === "en" ? "↻ Remove avatar" : "↻ Avatar entfernen"}
        </button>
      </div>

      {cropFile && (
        <AvatarCropper
          file={cropFile}
          onCancel={() => setCropFile(null)}
          onConfirm={uploadCropped}
        />
      )}
    </div>
  );
}

function tabBtn(active: boolean): React.CSSProperties {
  return {
    flex: 1, padding: "8px 10px", borderRadius: 10, border: "none",
    background: active ? "var(--bg-elevated)" : "transparent",
    color: active ? "var(--text)" : "var(--text-muted)",
    cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 700,
  };
}
