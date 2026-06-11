type Size = "sm" | "md" | "lg" | "xl";

const SIZES: Record<Size, string> = {
  sm: "h-7 w-10",
  md: "h-10 w-14",
  lg: "h-14 w-20",
  xl: "h-20 w-28",
};

// Kept for backwards-compat with CountryTile.tsx shim — no longer used internally.
export const EMOJI: Record<string, string> = {};

type Props = {
  code?: string;
  label?: string;
  size?: Size;
  showLabel?: boolean;
};

export function Flag3D({ code = "un", label, size = "md", showLabel = false }: Props) {
  const cc = code.toLowerCase();
  const src = `https://flagcdn.com/w160/${cc}.png`;
  const srcSet = `https://flagcdn.com/w160/${cc}.png 1x, https://flagcdn.com/w320/${cc}.png 2x`;
  return (
    <div className="flag-3d-wrapper group inline-flex flex-col items-center gap-1.5">
      <div className={`flag-3d ${SIZES[size]} rounded-lg`}>
        <img src={src} srcSet={srcSet} alt={label ?? cc} loading="lazy" />
      </div>
      {showLabel && label && (
        <span className="text-xs font-semibold text-text-3 whitespace-nowrap">{label}</span>
      )}
    </div>
  );
}
