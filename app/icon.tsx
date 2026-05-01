import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  const file = fs.readFileSync(path.join(process.cwd(), "public", "logo.png"));
  return new Response(new Uint8Array(file), {
    headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" },
  });
}
