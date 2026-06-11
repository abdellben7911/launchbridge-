// Cinematic, layered hero backdrop — adaptive light/dark, keeps mint headline readable.
export function HeroBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
      {/* Base neutral wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, var(--hero-bg-wash), transparent 70%), linear-gradient(180deg, var(--hero-bg-wash) 0%, var(--background) 100%)",
        }}
      />

      {/* Slow conic stage light above headline */}
      <div
        className="absolute left-1/2 top-[-30%] h-[900px] w-[900px] -translate-x-1/2 opacity-[0.18] dark:opacity-[0.30]"
        style={{
          background:
            "conic-gradient(from 200deg at 50% 50%, transparent 0deg, color-mix(in oklab, var(--primary) 60%, transparent) 60deg, transparent 120deg, color-mix(in oklab, var(--secondary) 50%, transparent) 200deg, transparent 260deg, color-mix(in oklab, var(--primary) 50%, transparent) 320deg, transparent 360deg)",
          filter: "blur(60px)",
          animation: "spotlight-spin 38s linear infinite",
        }}
      />

      {/* Drifting neutral blobs */}
      <div
        className="absolute -left-32 -top-24 h-[560px] w-[560px] rounded-full opacity-60 blur-3xl"
        style={{
          background: "radial-gradient(closest-side, var(--hero-blob-a), transparent)",
          animation: "aurora-a 22s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -right-40 top-10 h-[520px] w-[520px] rounded-full opacity-50 blur-3xl"
        style={{
          background: "radial-gradient(closest-side, var(--hero-blob-b), transparent)",
          animation: "aurora-b 28s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-[-160px] left-1/3 h-[460px] w-[460px] rounded-full opacity-45 blur-3xl"
        style={{
          background: "radial-gradient(closest-side, var(--hero-blob-c), transparent)",
          animation: "aurora-c 32s ease-in-out infinite",
        }}
      />

      {/* Emerald corner glows */}
      <div
        className="absolute -left-24 top-1/3 h-[360px] w-[360px] rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--secondary) 55%, transparent), transparent)",
          animation: "aurora-c 26s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -right-20 bottom-0 h-[380px] w-[380px] rounded-full opacity-35 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--primary) 55%, transparent), transparent)",
          animation: "aurora-a 30s ease-in-out infinite",
        }}
      />

      {/* Diagonal shimmering beam */}
      <div
        className="absolute left-[-20%] top-[20%] h-[140%] w-[18%] rotate-[18deg] opacity-[0.10] dark:opacity-[0.18]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, color-mix(in oklab, var(--secondary) 70%, transparent) 50%, transparent 100%)",
          filter: "blur(30px)",
          animation: "beam-shimmer 9s ease-in-out infinite",
        }}
      />

      {/* Dot grid with radial mask */}
      <div
        className="absolute inset-0 opacity-[0.18] dark:opacity-[0.28]"
        style={{
          backgroundImage:
            "radial-gradient(color-mix(in oklab, var(--foreground) 55%, transparent) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse at 50% 35%, black 0%, black 35%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 35%, black 0%, black 35%, transparent 75%)",
          animation: "grid-drift 60s linear infinite",
        }}
      />

      {/* Trajectory arcs (MEA → US feel) with signal dots */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.55] dark:opacity-[0.75]"
        viewBox="0 0 1440 800"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="arcStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--secondary)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M 80 620 Q 720 120 1360 580"
          fill="none"
          stroke="url(#arcStroke)"
          strokeWidth="1.4"
          strokeDasharray="6 14"
          style={{ animation: "arc-draw 14s linear infinite" }}
        />
        <path
          d="M 120 720 Q 720 260 1320 700"
          fill="none"
          stroke="url(#arcStroke)"
          strokeWidth="1"
          strokeDasharray="4 18"
          style={{ animation: "arc-draw 22s linear infinite reverse" }}
        />
        {/* Signal dots */}
        {[
          { cx: 240, cy: 480, d: "0s" },
          { cx: 720, cy: 180, d: "0.8s" },
          { cx: 1080, cy: 360, d: "1.6s" },
          { cx: 1240, cy: 620, d: "2.4s" },
        ].map((p, i) => (
          <g key={i}>
            <circle
              cx={p.cx}
              cy={p.cy}
              r="3.5"
              fill="var(--secondary)"
              style={{ animation: `signal-ping 3.2s ease-out ${p.d} infinite`, transformOrigin: `${p.cx}px ${p.cy}px` }}
            />
            <circle cx={p.cx} cy={p.cy} r="2" fill="var(--secondary)" />
          </g>
        ))}
      </svg>

      {/* Subtle grain */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.04] mix-blend-overlay" xmlns="http://www.w3.org/2000/svg">
        <filter id="hero-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#hero-noise)" />
      </svg>

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, transparent 35%, color-mix(in oklab, var(--background) 70%, transparent) 100%)",
        }}
      />

      {/* Bottom fade into page */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}
