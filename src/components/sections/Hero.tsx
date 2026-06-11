import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { HeroBackground } from "@/components/ui/HeroBackground";
import { RotatingPhrases } from "@/components/ui/RotatingPhrases";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { StatCounter } from "@/components/ui/StatCounter";
import { useLang } from "@/i18n/LanguageProvider";

export function Hero() {
  const { t, lang } = useLang();

  const phrases =
    lang === "fr"
      ? ["marché international", "présence globale", "empire digital", "+30 pays"]
      : lang === "ar"
      ? ["السوق الدولي", "حضور عالمي", "إمبراطورية رقمية", "+30 دولة"]
      : ["international market", "global presence", "digital empire", "30+ countries"];

  return (
    <section id="hero" className="relative overflow-hidden pt-28 pb-20">
      <HeroBackground />
      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto flex max-w-3xl flex-col items-center text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {t("hero.badge")}
          </span>

          <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-foreground md:text-7xl">
            <motion.span initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.05 }} className="inline-block">
              {t("hero.title.a")}{" "}
            </motion.span>
            <RotatingPhrases phrases={phrases} />
            <motion.span initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }} className="block text-text-2 mt-2 text-3xl md:text-4xl font-medium">
              {t("hero.title.suffix")}
            </motion.span>
          </h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.45 }} className="mt-7 max-w-2xl text-lg text-text-2">
            {t("hero.subtitle")}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }} className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
            <MagneticButton href="/contact" className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-elegant transition-shadow hover:shadow-dramatic">
              {t("hero.cta.primary")} <ArrowRight className="ms-1 h-4 w-4 rtl:rotate-180" />
            </MagneticButton>
            <Link to="/method" className="inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-primary/20 bg-surface px-6 text-sm font-semibold text-foreground transition-all hover:border-primary/50">
              {t("hero.cta.secondary")}
            </Link>
          </motion.div>
        </motion.div>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { text: "24h", label: t("stats.speed"), counter: null as null | { v: number; suf?: string; dec?: number } },
            { text: null, counter: { v: 30, suf: "+" }, label: t("stats.countries") },
            { text: "24/7", label: t("stats.support"), counter: null },
            { text: null, counter: { v: 5.0, dec: 1, suf: "/5" }, label: t("stats.rating") },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="rounded-[20px] border border-border bg-card/80 p-5 text-center backdrop-blur shadow-bento"
            >
              <div className="text-3xl font-extrabold text-foreground md:text-4xl" dir="ltr">
                {s.text ? s.text : <StatCounter to={s.counter!.v} suffix={s.counter!.suf ?? ""} decimals={s.counter!.dec ?? 0} />}
              </div>
              <div className="mt-1 text-xs font-medium text-text-3 uppercase tracking-wider">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
