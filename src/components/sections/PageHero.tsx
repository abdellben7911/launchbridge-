import { useLang } from "@/i18n/LanguageProvider";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { Sparkles, Pause } from "lucide-react";

type Props = {
  tagKey: string;
  titleKey: string;
  subtitleKey: string;
  /** @deprecated kept for backwards compatibility — no longer rendered */
  breadcrumbKey?: string;
};

/**
 * Centered inner-page hero with an animated aurora background.
 * Single column, generous breathing room, RTL-safe.
 * Includes a reduced-motion toggle that respects system preference.
 */
export function PageHero({ tagKey, titleKey, subtitleKey }: Props) {
  const { t, lang } = useLang();
  const systemPrefersReduced = useReducedMotion() ?? false;
  const [userOverride, setUserOverride] = useState<boolean | null>(null);
  const reduced = userOverride ?? systemPrefersReduced;

  const blobAnimate = reduced
    ? { x: 0, y: 0, scale: 1 }
    : undefined;
  const blobTransition = reduced
    ? { duration: 0 }
    : { duration: 18, repeat: Infinity, ease: "easeInOut" as const };

  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
      {/* Animated aurora blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
          style={{
            background:
              "radial-gradient(circle at center, color-mix(in oklab, var(--primary) 55%, transparent), transparent 70%)",
          }}
          animate={
            reduced
              ? { x: "-50%", y: 0, scale: 1 }
              : { x: ["-50%", "-40%", "-55%", "-50%"], y: [0, 18, -12, 0], scale: [1, 1.08, 0.96, 1] }
          }
          transition={blobTransition}
        />
        <motion.div
          className="absolute top-10 left-[15%] h-[380px] w-[380px] rounded-full opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(circle at center, color-mix(in oklab, var(--primary-glow, var(--primary)) 60%, transparent), transparent 70%)",
          }}
          animate={
            reduced
              ? { x: 0, y: 0, scale: 1 }
              : { x: [0, 40, -20, 0], y: [0, -24, 16, 0], scale: [1, 1.12, 0.94, 1] }
          }
          transition={{ ...blobTransition, duration: reduced ? 0 : 22 }}
        />
        <motion.div
          className="absolute bottom-0 right-[10%] h-[420px] w-[420px] rounded-full opacity-35 blur-3xl"
          style={{
            background:
              "radial-gradient(circle at center, color-mix(in oklab, var(--accent, var(--primary)) 55%, transparent), transparent 70%)",
          }}
          animate={
            reduced
              ? { x: 0, y: 0, scale: 1 }
              : { x: [0, -32, 18, 0], y: [0, 20, -16, 0], scale: [1, 0.92, 1.1, 1] }
          }
          transition={{ ...blobTransition, duration: reduced ? 0 : 20 }}
        />
      </div>

      {/* Subtle grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* Reduced-motion toggle */}
      <div className="absolute bottom-6 right-6 z-10 md:bottom-8 md:right-8">
        <button
          type="button"
          onClick={() => setUserOverride((prev) => (prev === null ? !systemPrefersReduced : !prev))}
          aria-pressed={reduced}
          title={reduced ? t("motion.enable") : t("motion.reduce")}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/15 bg-background/60 text-foreground/70 backdrop-blur-md transition hover:border-primary/30 hover:text-foreground hover:shadow-sm"
        >
          {reduced ? <Pause className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
        </button>
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.4 }}
          className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-primary backdrop-blur"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          {t(tagKey)}
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.55, delay: reduced ? 0 : 0.08 }}
          className="mt-6 font-serif-display text-[2.5rem] font-bold leading-[1.05] tracking-tight text-foreground md:text-6xl"
          style={{ textWrap: "balance", lineHeight: lang === "ar" ? 1.25 : undefined } as React.CSSProperties}
        >
          {t(titleKey)}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.55, delay: reduced ? 0 : 0.16 }}
          className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-text-2 md:text-[17px]"
          style={{ textWrap: "pretty" } as React.CSSProperties}
        >
          {t(subtitleKey)}
        </motion.p>
      </div>

      {/* Bottom fade */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 -z-10"
        style={{
          background:
            "linear-gradient(to bottom, transparent, color-mix(in oklab, var(--background) 92%, transparent))",
        }}
      />
    </section>
  );
}
