export default function Logo({ size = 32 }) {
  return (
    <a href="/" aria-label="Citaly, inicio" style={{ display: "inline-flex", alignItems: "center", gap: Math.round(size / 3), textDecoration: "none", color: "#1b1f1d" }}>
      <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
        <rect width="120" height="120" rx="28" fill="#0f766e" />
        <rect x="26" y="34" width="68" height="62" rx="10" fill="none" stroke="#fff" strokeWidth="6" />
        <path d="M26 54h68" stroke="#fff" strokeWidth="6" />
        <path d="M44 24v18M76 24v18" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
        <path d="M45 77l11 11 21-23" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ fontSize: Math.round(size * 0.9), fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1 }}>Cita<span style={{ color: "#0f766e" }}>ly</span></span>
    </a>
  );
}
