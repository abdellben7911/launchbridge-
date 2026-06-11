import { SectionTag } from "@/components/ui/SectionTag";
import { Flag3D } from "@/components/ui/Flag3D";
import { Reveal } from "@/components/ui/Reveal";
import { useLang } from "@/i18n/LanguageProvider";
import { Link } from "@tanstack/react-router";

type C = { code: string; en: string; fr: string; ar: string };

const REGIONS: { key: string; icon: string; title: { en: string; fr: string; ar: string }; list: C[] }[] = [
  {
    key: "me",
    icon: "🌙",
    title: { en: "Middle East", fr: "Moyen-Orient", ar: "الشرق الأوسط" },
    list: [
      { code: "sa", en: "Saudi Arabia", fr: "Arabie Saoudite", ar: "السعودية" },
      { code: "ae", en: "UAE", fr: "Émirats", ar: "الإمارات" },
      { code: "kw", en: "Kuwait", fr: "Koweït", ar: "الكويت" },
      { code: "qa", en: "Qatar", fr: "Qatar", ar: "قطر" },
      { code: "bh", en: "Bahrain", fr: "Bahreïn", ar: "البحرين" },
      { code: "om", en: "Oman", fr: "Oman", ar: "عُمان" },
      { code: "jo", en: "Jordan", fr: "Jordanie", ar: "الأردن" },
      { code: "lb", en: "Lebanon", fr: "Liban", ar: "لبنان" },
      { code: "iq", en: "Iraq", fr: "Irak", ar: "العراق" },
      { code: "ye", en: "Yemen", fr: "Yémen", ar: "اليمن" },
      { code: "ps", en: "Palestine", fr: "Palestine", ar: "فلسطين" },
    ],
  },
  {
    key: "na",
    icon: "🌍",
    title: { en: "North Africa", fr: "Afrique du Nord", ar: "شمال أفريقيا" },
    list: [
      { code: "ma", en: "Morocco", fr: "Maroc", ar: "المغرب" },
      { code: "dz", en: "Algeria", fr: "Algérie", ar: "الجزائر" },
      { code: "tn", en: "Tunisia", fr: "Tunisie", ar: "تونس" },
      { code: "eg", en: "Egypt", fr: "Égypte", ar: "مصر" },
      { code: "ly", en: "Libya", fr: "Libye", ar: "ليبيا" },
      { code: "sd", en: "Sudan", fr: "Soudan", ar: "السودان" },
    ],
  },
  {
    key: "ssa",
    icon: "🌱",
    title: { en: "Sub-Saharan Africa", fr: "Afrique Subsaharienne", ar: "أفريقيا جنوب الصحراء" },
    list: [
      { code: "ng", en: "Nigeria", fr: "Nigéria", ar: "نيجيريا" },
      { code: "gh", en: "Ghana", fr: "Ghana", ar: "غانا" },
      { code: "ke", en: "Kenya", fr: "Kenya", ar: "كينيا" },
      { code: "sn", en: "Senegal", fr: "Sénégal", ar: "السنغال" },
      { code: "ci", en: "Côte d'Ivoire", fr: "Côte d'Ivoire", ar: "ساحل العاج" },
      { code: "cm", en: "Cameroon", fr: "Cameroun", ar: "الكاميرون" },
      { code: "ml", en: "Mali", fr: "Mali", ar: "مالي" },
      { code: "et", en: "Ethiopia", fr: "Éthiopie", ar: "إثيوبيا" },
      { code: "tz", en: "Tanzania", fr: "Tanzanie", ar: "تنزانيا" },
      { code: "za", en: "South Africa", fr: "Afrique du Sud", ar: "جنوب أفريقيا" },
      { code: "rw", en: "Rwanda", fr: "Rwanda", ar: "رواندا" },
    ],
  },
];

function CountryChip({ c, lang }: { c: C; lang: "en" | "fr" | "ar" }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface p-3 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-bento">
      <Flag3D code={c.code} label={c[lang]} size="sm" />
      <span className="text-[11px] font-semibold text-text-2 text-center leading-tight">{c[lang]}</span>
    </div>
  );
}

export function CountriesGrid({ withHeading = true, compact = false }: { withHeading?: boolean; compact?: boolean; limit?: number }) {
  const { t, lang } = useLang();

  if (compact) {
    const featured = [
      { code: "ma", en: "Morocco", fr: "Maroc", ar: "المغرب" },
      { code: "sa", en: "Saudi Arabia", fr: "Arabie Saoudite", ar: "السعودية" },
      { code: "ae", en: "UAE", fr: "Émirats", ar: "الإمارات" },
      { code: "eg", en: "Egypt", fr: "Égypte", ar: "مصر" },
      { code: "ng", en: "Nigeria", fr: "Nigéria", ar: "نيجيريا" },
      { code: "dz", en: "Algeria", fr: "Algérie", ar: "الجزائر" },
      { code: "ke", en: "Kenya", fr: "Kenya", ar: "كينيا" },
      { code: "sn", en: "Senegal", fr: "Sénégal", ar: "السنغال" },
    ];
    return (
      <section id="countries" className="mx-auto max-w-7xl px-6 py-24">
        {withHeading && (
          <div className="mx-auto max-w-2xl text-center">
            <SectionTag>{t("countries.tag")}</SectionTag>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">{t("countries.title")}</h2>
            <p className="mt-4 text-lg text-text-2">{t("countries.subtitle")}</p>
          </div>
        )}
        <div className="mt-12 flex flex-wrap items-end justify-center gap-6">
          {featured.map((c) => (
            <Reveal key={c.code} delay={0.03}>
              <Flag3D code={c.code} label={c[lang]} size="lg" showLabel />
            </Reveal>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/countries" className="inline-flex items-center gap-2 rounded-full border-2 border-primary/20 bg-surface px-6 py-3 text-sm font-semibold text-foreground transition-all hover:border-primary/50">
            {t("countries.seeAll")} →
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section id="countries" className="mx-auto max-w-7xl px-6 py-24">
      {withHeading && (
        <Reveal>
          <div className="rounded-[24px] bg-foreground p-10 text-center text-background shadow-bento">
            <SectionTag>{t("countries.tag")}</SectionTag>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl">
              {lang === "fr" ? "Des fondateurs dans " : lang === "ar" ? "رواد أعمال في " : "Founders across "}
              <span className="text-secondary">{lang === "ar" ? "30+ دولة" : "30+ countries"}</span>
              {lang === "fr" ? " nous font confiance" : lang === "ar" ? " يثقون بنا" : " trust us"}
            </h2>
            <p className="mt-4 text-base opacity-70">{t("countries.subtitle")}</p>
          </div>
        </Reveal>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {REGIONS.map((r, idx) => (
          <Reveal key={r.key} delay={idx * 0.08}>
            <div className="h-full rounded-[24px] border border-border bg-card p-6 shadow-bento">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{r.icon}</span>
                <h3 className="text-lg font-bold text-foreground">{r.title[lang]}</h3>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-3">
                {r.list.map((c) => <CountryChip key={c.code} c={c} lang={lang} />)}
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <div className="mt-6 rounded-[24px] border border-primary/20 bg-secondary-light/40 p-6 text-center">
          <p className="text-sm text-foreground">
            🌐 {t("countries.notListed")}{" "}
            <Link to="/contact" className="font-semibold text-foreground underline underline-offset-4 decoration-primary">
              {t("countries.reachOut")}
            </Link>
            .
          </p>
        </div>
      </Reveal>
    </section>
  );
}
