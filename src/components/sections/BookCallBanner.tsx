import { CalendarDays } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";

const CALENDLY_URL = "https://calendly.com/consultation-llc-usa/30min";

export function BookCallBanner() {
  const { lang } = useLang();

  const label =
    lang === "ar" ? "حجز موعد" : lang === "fr" ? "Réserver un appel" : "Book a Call";

  const subtitle =
    lang === "ar"
      ? "احجز مكالمة مجانية لمدة ساعة — نحدد معك الولاية المناسبة، التكلفة، والجدول الزمني الكامل."
      : lang === "fr"
      ? "Réservez un appel gratuit d'1 heure — on choisit ensemble l'état, le coût et le calendrier exact."
      : "Book a free 1-hour call — we'll map out your state, cost, and exact timeline together.";

  const eyebrow =
    lang === "ar" ? "استشارة مجانية" : lang === "fr" ? "Consultation gratuite" : "Free Strategy Call";

  const heading =
    lang === "ar"
      ? "هل أنت مستعد لتأسيس شركتك الأمريكية؟"
      : lang === "fr"
      ? "Prêt à lancer votre LLC américaine ?"
      : "Ready to launch your US LLC?";

  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <div className="overflow-hidden rounded-2xl bg-[#0e6b55] px-8 py-10 text-white">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#6fcf97]">{eyebrow}</p>
            <h3 className="mt-2 font-serif-display text-2xl font-bold leading-snug">{heading}</h3>
            <p className="mt-2 max-w-md text-sm text-white/70">{subtitle}</p>
          </div>
          <div className="shrink-0">
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#c9a84c] px-6 py-3 text-sm font-bold text-white shadow-[0_4px_14px_rgba(201,168,76,0.4)] transition hover:bg-[#b8973d]"
            >
              <CalendarDays className="h-4 w-4" />
              {label}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
