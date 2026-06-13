import { MessageCircle, CalendarDays } from "lucide-react";
import { MeshOrbs } from "@/components/ui/MeshOrbs";
import { Reveal } from "@/components/ui/Reveal";
import { useLang } from "@/i18n/LanguageProvider";

const CALENDAR_URL = "https://calendly.com/consultation-llc-usa/30min";

/**
 * Renders the GC widget hidden (so it can open its popup),
 * and shows a custom-styled button that matches the WhatsApp button exactly.
 */

export function CtaBanner() {
  const { t, lang } = useLang();
  const calLabel =
    lang === "ar" ? "احجز موعد" : lang === "fr" ? "Réserver un appel" : "Book a strategy call";

  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div
        className="relative overflow-hidden rounded-[28px] border border-primary/20 p-12 text-center md:p-20"
        style={{ background: "var(--gradient-card)" }}
      >
        <MeshOrbs />
        <Reveal>
          <div className="relative z-10 text-primary-foreground">
            <p className="text-xs font-bold uppercase tracking-widest opacity-70">SCALE UP</p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tight md:text-6xl">
              <span className="font-serif-display">{t("cta.title")}</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base opacity-90 md:text-lg">
              {t("cta.subtitle")}
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href={CALENDAR_URL} target="_blank" rel="noreferrer" className="wow-cta inline-flex h-12 items-center gap-2 rounded-full border-2 border-background/40 px-6 text-sm font-semibold text-primary-foreground hover:bg-background/10">
                <span aria-hidden className="wow-shine" />
                <span className="relative z-10 inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" /> {calLabel}</span>
              </a>
              <a
                href="https://wa.me/212619999558"
                target="_blank"
                rel="noreferrer"
                className="wow-cta inline-flex h-12 items-center gap-2 rounded-full border-2 border-background/40 px-6 text-sm font-semibold text-primary-foreground hover:bg-background/10"
              >
                <span aria-hidden className="wow-shine" />
                <span className="relative z-10 inline-flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" /> {t("cta.secondary")}
                </span>
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
