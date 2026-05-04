// ═══════════════════════════════════════════════════════════
// Story-Card-Generator — produziert 1080×1920 PNG fürs Sharing
// Format passt für Instagram-Story, TikTok, WhatsApp-Status
// ═══════════════════════════════════════════════════════════

export type WorkoutCard = {
  title: string;          // z.B. "Push Day"
  subtitle?: string;      // z.B. "Strength · Woche 3"
  date: Date;
  stats: { label: string; value: string }[];   // z.B. [{label:"Volumen", value:"4.2 t"}]
  prList?: string[];      // optional: "Bench 110kg", "Squat 140kg"
  accentColor?: string;   // default cyan
  username?: string;
};

const W = 1080;
const H = 1920;

export async function renderWorkoutCard(card: WorkoutCard): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  if (!ctx) throw new Error("Canvas not supported");

  const accent = card.accentColor || "#22D3EE";
  const accent2 = adjust(accent, -30);

  // BG: dunkler Gradient
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#0a0c12");
  bg.addColorStop(1, "#15191f");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Akzent-Glow oben links
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 900);
  glow.addColorStop(0, hexA(accent, 0.35));
  glow.addColorStop(1, hexA(accent, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Akzent-Glow unten rechts
  const glow2 = ctx.createRadialGradient(W, H, 0, W, H, 800);
  glow2.addColorStop(0, hexA(accent2, 0.30));
  glow2.addColorStop(1, hexA(accent2, 0));
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, W, H);

  const PAD = 80;

  // Brand oben
  ctx.fillStyle = accent;
  ctx.font = "bold 60px 'DM Sans', system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("⚡ KALION MAX", PAD, 130);

  // Datum
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "500 36px 'JetBrains Mono', monospace";
  const dateStr = card.date.toLocaleDateString(undefined, {
    weekday: "short", day: "2-digit", month: "short", year: "numeric",
  }).toUpperCase();
  ctx.fillText(dateStr, PAD, 195);

  // Trenn-Linie
  ctx.strokeStyle = "rgba(255,255,255,0.10)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(PAD, 240);
  ctx.lineTo(W - PAD, 240);
  ctx.stroke();

  // Hauptlabel
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "800 30px 'DM Sans', system-ui, sans-serif";
  ctx.fillText("WORKOUT", PAD, 340);

  // Title (groß, fett)
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 130px 'DM Sans', system-ui, sans-serif";
  const titleY = 470;
  fillTextWrap(ctx, card.title, PAD, titleY, W - 2 * PAD, 140);

  // Subtitle
  if (card.subtitle) {
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.font = "500 42px 'DM Sans', system-ui, sans-serif";
    ctx.fillText(card.subtitle, PAD, titleY + 100);
  }

  // Stats Grid
  const statsY = 800;
  const cols = Math.min(card.stats.length, 3);
  const colW = (W - 2 * PAD) / cols;
  card.stats.slice(0, 3).forEach((s, i) => {
    const x = PAD + i * colW;
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "800 26px 'DM Sans', system-ui, sans-serif";
    ctx.fillText(s.label.toUpperCase(), x, statsY);

    ctx.fillStyle = accent;
    ctx.font = "900 92px 'DM Sans', system-ui, sans-serif";
    ctx.fillText(s.value, x, statsY + 110);
  });

  // PR-Liste
  if (card.prList && card.prList.length > 0) {
    let y = 1180;
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.font = "800 28px 'DM Sans', system-ui, sans-serif";
    ctx.fillText("🏆 PERSONAL RECORDS", PAD, y);
    y += 70;
    ctx.fillStyle = "#ffffff";
    ctx.font = "600 44px 'DM Sans', system-ui, sans-serif";
    card.prList.slice(0, 4).forEach((p) => {
      ctx.fillText(`· ${p}`, PAD, y);
      y += 70;
    });
  }

  // Username + URL unten
  if (card.username) {
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.font = "700 36px 'DM Sans', system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`@${card.username}`, PAD, H - 160);
  }
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.font = "500 32px 'JetBrains Mono', monospace";
  ctx.textAlign = "right";
  ctx.fillText("kalion-max.app", W - PAD, H - 160);

  // Bottom-Akzent-Bar
  const barH = 16;
  const barGrad = ctx.createLinearGradient(0, 0, W, 0);
  barGrad.addColorStop(0, accent);
  barGrad.addColorStop(1, accent2);
  ctx.fillStyle = barGrad;
  ctx.fillRect(0, H - barH, W, barH);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("toBlob failed"));
    }, "image/png", 0.95);
  });
}

// Text-Wrap-Helper
function fillTextWrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lineH: number) {
  const words = text.split(" ");
  let line = "";
  let yy = y;
  for (const w of words) {
    const test = line + w + " ";
    const m = ctx.measureText(test);
    if (m.width > maxW && line.length > 0) {
      ctx.fillText(line.trim(), x, yy);
      line = w + " ";
      yy += lineH;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, yy);
}

// Hex + Alpha
function hexA(hex: string, alpha: number): string {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// Hex aufhellen/abdunkeln
function adjust(hex: string, amount: number): string {
  const c = hex.replace("#", "");
  let r = Math.max(0, Math.min(255, parseInt(c.slice(0, 2), 16) + amount));
  let g = Math.max(0, Math.min(255, parseInt(c.slice(2, 4), 16) + amount));
  let b = Math.max(0, Math.min(255, parseInt(c.slice(4, 6), 16) + amount));
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}
