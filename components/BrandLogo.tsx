"use client";

import { useEffect, useState } from "react";

type Props = {
  size?: number;
  withText?: boolean;
  textSize?: number;
};

const SESSION_KEY = "kalion-logo-shown";

export default function BrandLogo({ size = 32, withText = true, textSize = 18 }: Props) {
  // Build-In-Animation nur einmal pro Browser-Session triggern
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY) === "1") return;
    setAnimate(true);
    sessionStorage.setItem(SESSION_KEY, "1");
  }, []);

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt="Kalion Max Logo"
        width={size}
        height={size}
        style={{
          width: size, height: size, objectFit: "contain",
          filter: "drop-shadow(0 2px 8px rgba(34,211,238,0.18))",
          animation: animate ? "kalion-logo-build 800ms cubic-bezier(0.16, 1, 0.3, 1) both" : undefined,
        }}
      />
      {withText && (
        <div
          className="brand"
          style={{
            fontSize: textSize, lineHeight: 1, display: "flex", alignItems: "baseline",
            animation: animate ? "kalion-page-in 600ms ease-out 200ms both" : undefined,
          }}
        >
          <span className="brand-kalion">KALION</span>
          <span className="brand-max" style={{ marginLeft: 6 }}>MAX</span>
        </div>
      )}
    </div>
  );
}
