type Props = {
  size?: number;
  withText?: boolean;
  textSize?: number;
};

export default function BrandLogo({ size = 32, withText = true, textSize = 18 }: Props) {
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
        }}
      />
      {withText && (
        <div
          className="brand"
          style={{ fontSize: textSize, lineHeight: 1, display: "flex", alignItems: "baseline" }}
        >
          <span className="brand-kalion">KALION</span>
          <span className="brand-max" style={{ marginLeft: 6 }}>MAX</span>
        </div>
      )}
    </div>
  );
}
