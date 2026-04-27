"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-client";
import { useToast } from "@/components/Toast";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";

const MEASUREMENTS = [
  { key: "weight",  label: "Gewicht",      unit: "kg", icon: "⚖️", color: "#2DD4BF" },
  { key: "bodyfat", label: "Körperfett",   unit: "%",  icon: "💧", color: "#60A5FA" },
  { key: "chest",   label: "Brust",        unit: "cm", icon: "💪", color: "#FF5A6B" },
  { key: "arm",     label: "Oberarm",      unit: "cm", icon: "🦾", color: "#F472B6" },
  { key: "waist",   label: "Taille",       unit: "cm", icon: "📐", color: "#FFB800" },
  { key: "thigh",   label: "Oberschenkel", unit: "cm", icon: "🦵", color: "#8B7FF0" },
];

export default function BodyPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<"measurements" | "photos">("measurements");
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editVal, setEditVal] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const { data: m } = await supabase
      .from("body_measurements").select("*")
      .order("recorded_at", { ascending: false });
    setMeasurements(m || []);

    const { data: p } = await supabase
      .from("progress_photos").select("*")
      .order("taken_at", { ascending: false });

    if (p) {
      const photosWithUrls = await Promise.all(
        p.map(async (photo) => {
          if (photo.storage_path) {
            const { data } = await supabase.storage.from("progress-photos")
              .createSignedUrl(photo.storage_path, 3600);
            return { ...photo, signed_url: data?.signedUrl };
          }
          return photo;
        })
      );
      setPhotos(photosWithUrls);
    }
    setLoading(false);
  }

  async function saveMeasurement(key: string, unit: string) {
    const v = parseFloat(editVal.replace(",", "."));
    if (isNaN(v) || v <= 0) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("body_measurements").insert({
      user_id: user.id, measurement_type: key, value: v, unit,
    });
    setEditing(null); setEditVal("");
    toast("Messung gespeichert", { type: "success", icon: "📏" });
    load();
  }

  async function uploadPhoto(file: File) {
    setUploading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUploading(false); return; }

    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from("progress-photos").upload(path, file);

    if (uploadErr) {
      toast("Upload-Fehler: " + uploadErr.message, { type: "error" });
      setUploading(false);
      return;
    }

    await supabase.from("progress_photos").insert({
      user_id: user.id, photo_url: path, storage_path: path,
    });

    toast("Foto hochgeladen", { type: "success", icon: "📸" });
    setUploading(false);
    load();
  }

  async function deletePhoto(id: string, path: string) {
    if (!confirm("Foto wirklich löschen?")) return;
    const supabase = createClient();
    if (path) await supabase.storage.from("progress-photos").remove([path]);
    await supabase.from("progress_photos").delete().eq("id", id);
    load();
  }

  function latestFor(key: string) {
    return measurements.find((m) => m.measurement_type === key);
  }

  function previousFor(key: string) {
    const filtered = measurements.filter((m) => m.measurement_type === key);
    return filtered[1];
  }

  return (
    <div>
      <div style={{
        display: "flex", gap: 4, padding: 4, background: "var(--bg-raised)",
        border: "1px solid var(--border)", borderRadius: 14, marginBottom: 20,
      }}>
        {(["measurements", "photos"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: 10, borderRadius: 10, border: "none",
            background: tab === t ? "var(--bg-elevated)" : "transparent",
            color: tab === t ? "var(--text)" : "var(--text-muted)",
            cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 700,
          }}>{t === "measurements" ? "📏 Maße" : "📸 Fotos"}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}><div className="spinner" style={{ margin: "0 auto" }} /></div>
      ) : tab === "measurements" ? (
        <>
          <div className="card">
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>📏 Körpermaße</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
              {MEASUREMENTS.map((m) => {
                const latest = latestFor(m.key);
                const prev = previousFor(m.key);
                const diff = latest && prev ? (latest.value - prev.value).toFixed(1) : null;
                return (
                  <div key={m.key} className="card" style={{ padding: 18, marginBottom: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 22 }}>{m.icon}</span>
                      <button onClick={() => { setEditing(m.key); setEditVal(""); }} style={{
                        background: "var(--surface)", border: "1px solid var(--border)",
                        borderRadius: 8, color: "var(--text-muted)", cursor: "pointer",
                        width: 28, height: 28, fontSize: 13,
                      }}>+</button>
                    </div>
                    <div style={{
                      fontFamily: "var(--font-display)", fontStyle: "italic",
                      fontSize: 32, fontWeight: 800, letterSpacing: -1,
                      color: m.color, marginTop: 10, lineHeight: 1,
                    }}>
                      {latest ? latest.value : "—"}
                      <span style={{ fontSize: 14, color: "var(--text-dim)", fontStyle: "normal", fontFamily: "var(--font-body)", marginLeft: 4 }}>
                        {latest ? m.unit : ""}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 700, marginTop: 4 }}>{m.label}</div>
                    {diff && parseFloat(diff) !== 0 && (
                      <div style={{
                        fontSize: 11, marginTop: 4, fontWeight: 800,
                        color: parseFloat(diff) > 0 ? "var(--green)" : "var(--red)",
                      }}>
                        {parseFloat(diff) > 0 ? "↑" : "↓"} {Math.abs(parseFloat(diff))} {m.unit}
                      </div>
                    )}
                    {editing === m.key && (
                      <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                        <input type="number" inputMode="decimal" step="0.1"
                          value={editVal} onChange={(e) => setEditVal(e.target.value)}
                          autoFocus placeholder={m.unit}
                          style={{
                            background: "var(--bg)", border: "1px solid var(--border-active)",
                            borderRadius: 8, padding: "6px 10px", width: 70,
                            color: "var(--text)", fontFamily: "var(--font-mono)",
                            fontSize: 13, fontWeight: 700, outline: "none",
                          }} />
                        <button onClick={() => saveMeasurement(m.key, m.unit)} style={{
                          background: "var(--accent)", border: "1px solid var(--accent)",
                          borderRadius: 8, padding: "6px 12px", color: "white",
                          cursor: "pointer", fontSize: 12, fontWeight: 800, fontFamily: "inherit",
                        }}>OK</button>
                        <button onClick={() => setEditing(null)} style={{
                          background: "var(--bg-raised)", border: "1px solid var(--border)",
                          borderRadius: 8, padding: "6px 10px", color: "var(--text-dim)",
                          cursor: "pointer", fontSize: 12, fontFamily: "inherit",
                        }}>✕</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {measurements.length > 0 && (
            <div className="card">
              <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>📜 Mess-Historie</div>
              {measurements.slice(0, 15).map((e) => {
                const m = MEASUREMENTS.find((x) => x.key === e.measurement_type);
                const d = new Date(e.recorded_at);
                return (
                  <div key={e.id} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "12px 0", borderBottom: "1px solid var(--border)",
                  }}>
                    <div style={{ fontSize: 22 }}>{m?.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{m?.label}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                        {d.toLocaleDateString("de-DE")}
                      </div>
                    </div>
                    <div style={{
                      fontFamily: "var(--font-display)", fontStyle: "italic",
                      fontWeight: 800, fontSize: 20, letterSpacing: -0.5, color: m?.color,
                    }}>{e.value}<span style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "normal", fontFamily: "var(--font-body)", marginLeft: 4 }}>{m?.unit}</span></div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="card">
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>📸 Progress-Fotos</div>
            <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 16, lineHeight: 1.5 }}>
              Dokumentiere deinen Fortschritt — nur du selbst siehst diese Bilder.
            </div>
            <label style={{
              display: "block", padding: 20, border: "2px dashed var(--border-active)",
              borderRadius: 14, background: "var(--bg-elevated)", textAlign: "center",
              cursor: "pointer", marginBottom: 20,
            }}>
              <input type="file" accept="image/*" style={{ display: "none" }}
                onChange={(e) => { if (e.target.files?.[0]) uploadPhoto(e.target.files[0]); }}
                disabled={uploading} />
              <div style={{ fontSize: 36, marginBottom: 8 }}>{uploading ? "⏳" : "📷"}</div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>
                {uploading ? "Wird hochgeladen..." : "Foto hinzufügen"}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>JPG, PNG — privat gespeichert</div>
            </label>

            {photos.length === 0 ? (
              <div style={{ textAlign: "center", padding: 30, color: "var(--text-muted)" }}>
                <div style={{ fontSize: 13 }}>Noch keine Fotos</div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
                {photos.map((p) => {
                  const d = new Date(p.taken_at);
                  return (
                    <div key={p.id} style={{ position: "relative", borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)" }}>
                      {p.signed_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.signed_url} alt="" style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover" }} />
                      ) : (
                        <div style={{ aspectRatio: "3/4", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>📸</div>
                      )}
                      <div style={{
                        position: "absolute", bottom: 0, left: 0, right: 0,
                        padding: "8px 10px", background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
                        fontSize: 11, fontWeight: 700, color: "white",
                      }}>{d.toLocaleDateString("de-DE")}</div>
                      <button onClick={() => deletePhoto(p.id, p.storage_path)} style={{
                        position: "absolute", top: 6, right: 6, width: 26, height: 26,
                        borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.6)",
                        color: "white", cursor: "pointer", fontSize: 14,
                      }}>✕</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card">
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>↔ Vorher / Nachher</div>
            <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 14 }}>
              Wische über das Bild, um zwei Fotos direkt zu vergleichen.
            </div>
            <BeforeAfterSlider photos={photos} />
          </div>
        </>
      )}
    </div>
  );
}
