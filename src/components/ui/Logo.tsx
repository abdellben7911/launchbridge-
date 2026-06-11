export function Logo({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`} aria-label="LaunchBridge">
      <svg viewBox="0 0 40 40" className="h-8 w-8" role="img" aria-hidden>
        <g transform="rotate(45 20 20)">
          <rect x="4" y="4" width="14" height="14" fill="#6fcf97" rx="1.5" />
          <rect x="22" y="4" width="14" height="14" fill="#1f6f5f" rx="1.5" />
          <rect x="4" y="22" width="14" height="14" fill="#1f6f5f" rx="1.5" />
          <rect x="22" y="22" width="14" height="14" fill="#6fcf97" rx="1.5" />
        </g>
      </svg>
      <span className="text-lg font-extrabold tracking-tight">
        <span style={{ color: "#1f6f5f" }} className="dark:!text-[#6fcf97]">LAUNCH</span>
        <span style={{ color: "#6fcf97" }}>BRIDGE</span>
      </span>
    </div>
  );
}
