import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef, type ReactNode, type MouseEvent } from "react";

type Props = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  strength?: number;
  /** Adds the wow lockup: shine sweep + halo + pulse on touch. Default true. */
  wow?: boolean;
};

export function MagneticButton({ children, href, onClick, className, strength = 0.35, wow = true }: Props) {
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 200, damping: 15, mass: 0.4 });

  const handleMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    // Skip magnetic pull on touch / no-hover devices
    if (typeof window !== "undefined" && window.matchMedia?.("(hover: none)").matches) return;
    const rect = el.getBoundingClientRect();
    const mx = e.clientX - rect.left - rect.width / 2;
    const my = e.clientY - rect.top - rect.height / 2;
    x.set(mx * strength);
    y.set(my * strength);
  };
  const handleLeave = () => { x.set(0); y.set(0); };

  const wowClass = wow ? "wow-cta" : "";
  const inner = (
    <>
      {wow && <span aria-hidden className="wow-halo" />}
      {wow && <span aria-hidden className="wow-shine" />}
      <motion.span className="relative z-10 inline-flex items-center justify-center gap-2" style={{ x: sx, y: sy }}>
        {children}
      </motion.span>
    </>
  );

  const composed = `${wowClass} ${className ?? ""}`.trim();

  if (href) {
    return (
      <a ref={ref as React.RefObject<HTMLAnchorElement>} href={href} onMouseMove={handleMove} onMouseLeave={handleLeave} className={composed}>
        {inner}
      </a>
    );
  }
  return (
    <button ref={ref as React.RefObject<HTMLButtonElement>} onClick={onClick} onMouseMove={handleMove} onMouseLeave={handleLeave} className={composed}>
      {inner}
    </button>
  );
}
