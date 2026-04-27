import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f1218 0%, #1d2230 100%)",
          color: "#22D3EE",
          fontSize: 320,
          fontWeight: 900,
          letterSpacing: -20,
        }}
      >
        ⚡
      </div>
    ),
    { ...size }
  );
}
