import { Check } from "lucide-react";
import { SectionTag } from "@/components/ui/SectionTag";
import { useLang } from "@/i18n/LanguageProvider";
import { useCurrency } from "@/i18n/CurrencyProvider";
import type { Lang } from "@/i18n/translations";

type Plan = {
  id: string;
  name: { en: string; fr: string; ar: string };
  usd: number;
  features: { en: string; fr: string; ar: string }[];
  featured?: boolean;
};

const plans: Plan[] = [
  {
    id: "starter",
    name: { en: "Starter", fr: "Starter", ar: "ستارتر" },
    usd: 299,
    features: [
      { en: "LLC Formation (Wyoming)", fr: "Création LLC (Wyoming)", ar: "تأسيس LLC (وايومنغ)" },
      { en: "EIN Number", fr: "Numéro EIN", ar: "رقم EIN" },
      { en: "Operating Agreement", fr: "Contrat d'exploitation", ar: "عقد التشغيل" },
      { en: "Registered Agent (1yr)", fr: "Agent enregistré (1 an)", ar: "وكيل مسجل (سنة)" },
      { en: "US Address", fr: "Adresse US", ar: "عنوان أمريكي" },
    ],
  },
  {
    id: "pro",
    name: { en: "Pro", fr: "Pro", ar: "برو" },
    usd: 549,
    featured: true,
    features: [
      { en: "Everything in Starter", fr: "Tout dans Starter", ar: "كل ما في ستارتر" },
      { en: "US Business Bank Account", fr: "Compte bancaire d'entreprise US", ar: "حساب بنكي تجاري أمريكي" },
      { en: "Stripe Activation", fr: "Activation Stripe", ar: "تفعيل Stripe" },
      { en: "PayPal Business Setup", fr: "Configuration PayPal Business", ar: "إعداد PayPal Business" },
      { en: "Priority Support", fr: "Support prioritaire", ar: "دعم ذو أولوية" },
    ],
  },
  {
    id: "elite",
    name: { en: "Elite", fr: "Elite", ar: "إليت" },
    usd: 999,
    features: [
      { en: "Everything in Pro", fr: "Tout dans Pro", ar: "كل ما في برو" },
      { en: "Wise Business Account", fr: "Compte Wise Business", ar: "حساب Wise Business" },
      { en: "Annual Report Filing (1yr)", fr: "Rapport annuel (1 an)", ar: "تقرير سنوي (سنة)" },
      { en: "Trademark Search", fr: "Recherche de marque", ar: "بحث عن العلامة التجارية" },
      { en: "Dedicated Account Manager", fr: "Gestionnaire de compte dédié", ar: "مدير حساب مخصص" },
    ],
  },
];

export function Pricing({ withHeading = true }: { withHeading?: boolean } = {}) {
  const { t, lang } = useLang();
  const { format, currency } = useCurrency();
  const l = lang as Lang;

  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
      {withHeading && (
        <div className="mx-auto max-w-2xl text-center">
          <SectionTag>{t("pricing.tag")}</SectionTag>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
            {t("pricing.title")}
          </h2>
          <p className="mt-4 text-lg text-text-2">{t("pricing.subtitle")}</p>
        </div>
      )}

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {plans.map((p) => {
          const featured = !!p.featured;
          return (
            <div
              key={p.id}
              className={`relative rounded-[24px] p-8 transition-all hover:-translate-y-1 ${
                featured
                  ? "text-primary-foreground shadow-dramatic [background:var(--gradient-card)]"
                  : "bg-card border border-border shadow-soft hover:shadow-elegant"
              }`}
            >
              {featured && (
                <div className="absolute -top-3 end-6 rounded-full bg-foreground px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-background">
                  {t("pricing.popular")}
                </div>
              )}
              <div className={`text-sm font-semibold ${featured ? "opacity-80" : "text-text-3"}`}>
                {p.name[l]}
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-5xl font-extrabold tracking-tight" dir="ltr">
                  <bdi>{format(p.usd)}</bdi>
                </span>
              </div>
              {currency.code !== "USD" && (
                <div className={`mt-1 text-xs ${featured ? "opacity-70" : "text-text-3"}`} dir="ltr">
                  ≈ ${p.usd} USD
                </div>
              )}

              <ul className="mt-6 space-y-3">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className={`mt-0.5 h-4 w-4 shrink-0 ${featured ? "" : "text-primary"}`} />
                    <span className={featured ? "opacity-95" : "text-text-2"}>{f[l]}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5 ${
                  featured
                    ? "bg-background text-primary hover:shadow-elegant"
                    : "bg-primary text-primary-foreground hover:shadow-elegant"
                }`}
              >
                {t("pricing.cta")} →
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
}
