import { Quote, Star } from "lucide-react";
import { SectionTag } from "@/components/ui/SectionTag";
import { Flag3D } from "@/components/ui/Flag3D";
import { useLang } from "@/i18n/LanguageProvider";
import { useState } from "react";

type T = {
  q: { en: string; fr: string; ar: string };
  metric: string;
  name: string;
  role: { en: string; fr: string; ar: string };
  country: string;
  countryName: string;
};

const ITEMS: T[] = [
  {
    q: { en: "From signed contract to live Stripe in 9 days. Now scaling at $80K/mo.", fr: "Du contrat signé au Stripe actif en 9 jours. On scale à 80K$/mois.", ar: "من العقد الموقع إلى Stripe النشط في 9 أيام. الآن نمو بـ80 ألف دولار شهرياً." },
    metric: "$80K MRR", name: "Yassir B.", role: { en: "E-com founder", fr: "Fondateur e-com", ar: "مؤسس تجارة" },
    country: "ma", countryName: "Morocco",
  },
  {
    q: { en: "The funnel converts at 4.7%. Pure operator thinking.", fr: "Le funnel convertit à 4.7%. Pensée pure d'opérateur.", ar: "القمع يحوّل بنسبة 4.7٪. تفكير تشغيلي بحت." },
    metric: "4.7% CVR", name: "Layla A.", role: { en: "DTC founder", fr: "Fondatrice DTC", ar: "مؤسسة DTC" },
    country: "sa", countryName: "Saudi Arabia",
  },
  {
    q: { en: "Saved 3 months. Worth every cent.", fr: "3 mois économisés. Vaut chaque centime.", ar: "وفّر 3 أشهر. يستحق كل قرش." },
    metric: "3 months saved", name: "Mohammed K.", role: { en: "Agency owner", fr: "Propriétaire d'agence", ar: "صاحب وكالة" },
    country: "ae", countryName: "UAE",
  },
  {
    q: { en: "I sell to the US from Dakar. They made it boring.", fr: "Je vends aux USA depuis Dakar. Ils ont rendu ça banal.", ar: "أبيع للولايات المتحدة من داكار. جعلوا الأمر بسيطاً." },
    metric: "$22K launch", name: "Aïcha D.", role: { en: "Course creator", fr: "Créatrice de cours", ar: "صانعة محتوى" },
    country: "sn", countryName: "Senegal",
  },
  {
    q: { en: "ROAS jumped 1.8 → 3.4 in 6 weeks.", fr: "ROAS passé de 1.8 à 3.4 en 6 semaines.", ar: "زاد ROAS من 1.8 إلى 3.4 في 6 أسابيع." },
    metric: "3.4x ROAS", name: "Tunde O.", role: { en: "Dropshipper", fr: "Dropshipper", ar: "دروبشيبر" },
    country: "ng", countryName: "Nigeria",
  },
  {
    q: { en: "EIN + Mercury + Stripe + landing — turnkey. I brought the product. They brought the rest.", fr: "EIN + Mercury + Stripe + landing — clé en main.", ar: "EIN + Mercury + Stripe + صفحة هبوط — جاهز." },
    metric: "Live in 14d", name: "Sofiane M.", role: { en: "SaaS founder", fr: "Fondateur SaaS", ar: "مؤسس SaaS" },
    country: "dz", countryName: "Algeria",
  },
  {
    q: { en: "Best growth partner I've had. Honest, fast, surgical.", fr: "Meilleur partenaire de croissance. Honnête, rapide, chirurgical.", ar: "أفضل شريك نمو حصلت عليه." },
    metric: "+212% revenue", name: "Khalid R.", role: { en: "DTC operator", fr: "Opérateur DTC", ar: "مشغّل DTC" },
    country: "qa", countryName: "Qatar",
  },
  {
    q: { en: "Two weeks to a US LLC and a payment-ready store. Unreal.", fr: "Deux semaines pour une LLC US et un store prêt à encaisser.", ar: "أسبوعان لتأسيس LLC وستور جاهز للدفع." },
    metric: "14d to launch", name: "Mariam H.", role: { en: "Founder", fr: "Fondatrice", ar: "مؤسسة" },
    country: "eg", countryName: "Egypt",
  },
];

function Card({ it, lang }: { it: T; lang: "en" | "fr" | "ar" }) {
  return (
    <article className="group relative flex h-full w-[340px] shrink-0 flex-col rounded-[22px] border border-border bg-card p-6 shadow-bento transition-transform duration-300 hover:-translate-y-1 md:w-[400px]">
      <div className="flex items-center justify-between">
        <Quote className="h-6 w-6 text-primary/40" />
        <div className="flex gap-0.5 text-amber-500">
          {Array.from({ length: 5 }).map((_, j) => <Star key={j} className="h-3.5 w-3.5 fill-current" />)}
        </div>
      </div>
      <div className="mt-4 font-serif-display text-2xl leading-none text-primary md:text-3xl" dir="ltr">{it.metric}</div>
      <p className="mt-3 flex-1 text-[0.95rem] italic leading-relaxed text-text-2 line-clamp-4">"{it.q[lang]}"</p>
      <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
        <Flag3D code={it.country} label={it.countryName} size="sm" />
        <div>
          <div className="text-sm font-bold text-foreground">{it.name}</div>
          <div className="text-xs text-text-3">{it.role[lang]} · {it.countryName}</div>
        </div>
      </div>
    </article>
  );
}

function Row({ items, lang, reverse, duration }: { items: T[]; lang: "en" | "fr" | "ar"; reverse?: boolean; duration: number }) {
  const [paused, setPaused] = useState(false);
  const loop = [...items, ...items];
  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
      <div
        className="flex w-max gap-5"
        style={{
          animation: `${reverse ? "marquee-reverse" : "marquee"} ${duration}s linear infinite`,
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        {loop.map((it, i) => <Card key={`${it.name}-${i}`} it={it} lang={lang} />)}
      </div>
    </div>
  );
}

export function TestimonialsBento() {
  const { t, lang } = useLang();
  const half = Math.ceil(ITEMS.length / 2);
  const rowA = ITEMS.slice(0, half);
  const rowB = ITEMS.slice(half).concat(ITEMS.slice(0, 1));

  return (
    <section id="testimonials" className="py-24">
      <div className="mx-auto mb-12 max-w-2xl px-6 text-center">
        <SectionTag>{t("testimonials.tag")}</SectionTag>
        <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">{t("testimonials.title")}</h2>
      </div>

      <div className="flex flex-col gap-6">
        <Row items={rowA} lang={lang} duration={48} />
        <Row items={rowB} lang={lang} duration={62} reverse />
      </div>
    </section>
  );
}
