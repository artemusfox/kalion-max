// ═══════════════════════════════════════════════════════════
// Social-Sharing — Web Share API + Fallbacks
// ═══════════════════════════════════════════════════════════

export type ShareData = {
  title: string;
  text: string;
  url?: string;
  imageBlob?: Blob;
  imageFilename?: string;
};

// Native Web-Share-API verfügbar? (mobile primary, desktop teils)
export function canNativeShare(withFile = false): boolean {
  if (typeof navigator === "undefined" || !navigator.share) return false;
  if (withFile && !(navigator as any).canShare) return false;
  return true;
}

// Native Share-Sheet öffnen (User wählt App)
export async function nativeShare(data: ShareData): Promise<boolean> {
  if (!canNativeShare()) return false;
  try {
    const payload: any = { title: data.title, text: data.text };
    if (data.url) payload.url = data.url;
    if (data.imageBlob && (navigator as any).canShare) {
      const file = new File([data.imageBlob], data.imageFilename || "kalion-share.png", { type: "image/png" });
      const filePayload = { ...payload, files: [file] };
      if ((navigator as any).canShare(filePayload)) {
        await navigator.share(filePayload);
        return true;
      }
    }
    await navigator.share(payload);
    return true;
  } catch (e: any) {
    if (e?.name === "AbortError") return false;
    console.error("Share failed", e);
    return false;
  }
}

// WhatsApp Direct-Link (funktioniert immer — Browser oder App)
export function whatsappUrl(text: string, url?: string): string {
  const fullText = url ? `${text} ${url}` : text;
  return `https://wa.me/?text=${encodeURIComponent(fullText)}`;
}

// Bild als Download anstoßen (Fallback für IG/TikTok)
export function downloadImage(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Twitter / X Share (optional, falls jemand)
export function twitterUrl(text: string, url?: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}${url ? `&url=${encodeURIComponent(url)}` : ""}`;
}

// Telegram Share
export function telegramUrl(text: string, url?: string): string {
  return `https://t.me/share/url?text=${encodeURIComponent(text)}${url ? `&url=${encodeURIComponent(url)}` : ""}`;
}
