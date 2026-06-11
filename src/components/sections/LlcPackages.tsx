import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Check, Truck, Star, Crown } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { SectionTag } from "@/components/ui/SectionTag";
import { useLang } from "@/i18n/LanguageProvider";
import { useCurrency } from "@/i18n/CurrencyProvider";
import type { Lang } from "@/i18n/translations";

type Service = {
  id: string;
  slug: string;
  name_en: string;
  name_fr: string | null;
  name_ar: string | null;
  features: { k: string }[] | null;
  us_state: string | null;
  tier: string | null;
  price_mad: number | null;
  original_price_mad: number | null;
  delivery_days: number | null;
  badge_key: string | null;
  group_key: string | null;
  sort_order: number | null;
};

const STATE_TABS: { key: string; en: string; fr: string; ar: string }[] = [
  { key: "wyoming", en: "Wyoming", fr: "Wyoming", ar: "وايومنغ" },
  { key: "montana", en: "Montana", fr: "Montana", ar: "مونتانا" },
  { key: "new_mexico", en: "New Mexico", fr: "New Mexico", ar: "نيو مكسيكو" },
];

const STATE_SUB: Record<string, { en: string; fr: string; ar: string }> = {
  wyoming: {
    en: "Most popular for non-residents — Stripe & PayPal friendly",
    fr: "Le plus populaire pour les non-résidents — compatible Stripe & PayPal",
    ar: "الأكثر شعبية لغير المقيمين — مناسبة لـ Stripe و PayPal",
  },
  montana: {
    en: "Fastest, most affordable — perfect for a strong start",
    fr: "Le plus rapide et le moins cher — idéal pour bien démarrer",
    ar: "أسرع وأوفر خيار — مناسب لبداية قوية",
  },
  new_mexico: {
    en: "Cheapest path for beginners — no complications",
    fr: "L'option la plus économique pour débuter — sans complications",
    ar: "الخيار الأوفر للمبتدئين — بدون تعقيدات",
  },
};

const TIER_LABEL: Record<string, { en: string; fr: string; ar: string }> = {
  basic: { en: "BASIC", fr: "BASIC", ar: "BASIC" },
  ultimate: { en: "ULTIMATE", fr: "ULTIMATE", ar: "ULTIMATE" },
  ultimate_launch: { en: "ULTIMATE LAUNCH", fr: "ULTIMATE LAUNCH", ar: "ULTIMATE LAUNCH" },
};
const TIER_INDEX: Record<string, string> = { basic: "01", ultimate: "02", ultimate_launch: "03" };
const TIER_ORDER: Record<string, number> = { basic: 1, ultimate: 2, ultimate_launch: 3 };

const FEATURE_COPY: Record<string, { en: string; fr: string; ar: string }> = {
  llc_creation: { en: "LLC Creation", fr: "Création LLC", ar: "تأسيس LLC" },
  registered_agent: { en: "Registered Agent", fr: "Agent enregistré", ar: "وكيل مسجل" },
  us_phone: { en: "US Phone Number", fr: "Numéro US", ar: "رقم أمريكي" },
  ein: { en: "EIN", fr: "EIN", ar: "EIN" },
  stripe_2: { en: "2× Stripe", fr: "2× Stripe", ar: "2× Stripe" },
  paypal_business: { en: "PayPal Business", fr: "PayPal Business", ar: "PayPal Business" },
  wise_business: { en: "Wise Business", fr: "Wise Business", ar: "Wise Business" },
  mercury_account: { en: "Mercury Account", fr: "Compte Mercury", ar: "حساب Mercury" },
  payoneer_business: { en: "Payoneer Business", fr: "Payoneer Business", ar: "Payoneer Business" },
  shopify_payment: { en: "Shopify Payment", fr: "Shopify Payment", ar: "Shopify Payment" },
  all_ultimate: { en: "Everything in Ultimate", fr: "Tout dans Ultimate", ar: "كل مميزات Ultimate" },
  store_setup: { en: "Shopify or WordPress store setup", fr: "Boutique Shopify ou WordPress", ar: "إعداد متجر Shopify أو WordPress" },
};

const BADGE_COPY: Record<string, { en: string; fr: string; ar: string }> = {
  most_requested: { en: "Most requested", fr: "Le plus demandé", ar: "الأكثر طلباً" },
  recommended: { en: "Recommended", fr: "Recommandé", ar: "موصى به" },
  best_value: { en: "Best value", fr: "Meilleure offre", ar: "الأفضل قيمة" },
};

function tierName(s: Service, l: Lang) {
  return s.tier ? TIER_LABEL[s.tier]?.[l] ?? s.tier.toUpperCase() : (l === "en" ? s.name_en : l === "fr" ? s.name_fr ?? s.name_en : s.name_ar ?? s.name_en);
}

function deliveryLabel(days: number | null, l: Lang) {
  if (!days) return "";
  if (l === "ar") {
    if (days === 1) return "يوم واحد";
    if (days === 2) return "يومان";
    if (days <= 10) return `${days} أيام`;
    return `${days} يوم`;
  }
  if (l === "fr") return days === 1 ? "1 jour" : `${days} jours`;
  return days === 1 ? "1 day" : `${days} days`;
}

export function LlcPackages() {
  const { t, lang } = useLang();
  const { formatFromMAD, formatMAD, currency } = useCurrency();
  const l = lang as Lang;
  const [active, setActive] = useState<string>("wyoming");

  const { data, isLoading } = useQuery({
    queryKey: ["llc-packages"],
    queryFn: async (): Promise<Service[]> => {
      const { data, error } = await supabase
        .from("services")
        .select("id, slug, name_en, name_fr, name_ar, features, us_state, tier, price_mad, original_price_mad, delivery_days, badge_key, group_key, sort_order")
        .not("group_key", "is", null)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Service[];
    },
  });

  const grouped = useMemo(() => {
    const out: Record<string, Service[]> = { wyoming: [], montana: [], new_mexico: [] };
    (data ?? []).forEach((s) => {
      if (s.group_key && out[s.group_key]) out[s.group_key].push(s);
    });
    Object.values(out).forEach((arr) =>
      arr.sort((a, b) => (TIER_ORDER[a.tier ?? ""] ?? 99) - (TIER_ORDER[b.tier ?? ""] ?? 99)),
    );
    return out;
  }, [data]);

  const cards = grouped[active] ?? [];

  const titles = {
    wyoming: { en: "Wyoming packages", fr: "Packs Wyoming", ar: "باقات وايومنغ" },
    montana: { en: "Montana packages", fr: "Packs Montana", ar: "باقات مونتانا" },
    new_mexico: { en: "New Mexico packages", fr: "Packs New Mexico", ar: "باقات نيو مكسيكو" },
  } as const;

  return (
    <section id="llc-packages" className="relative mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <SectionTag>{t("services.tag")}</SectionTag>
        <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
          {titles[active as keyof typeof titles][l]}
        </h2>
        <p className="mt-4 text-lg text-text-2">{STATE_SUB[active][l]}</p>
      </div>

      {/* State tabs */}
      <div className="mt-8 flex justify-center">
        <div className="inline-flex rounded-full border border-border bg-card p-1 shadow-soft">
          {STATE_TABS.map((s) => (
            <button
              key={s.key}
              onClick={() => setActive(s.key)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                active === s.key
                  ? "bg-primary text-primary-foreground shadow-elegant"
                  : "text-text-2 hover:text-foreground"
              }`}
            >
              {s[l]}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      {isLoading ? (
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[520px] animate-pulse rounded-[24px] bg-card border border-border" />
          ))}
        </div>
      ) : (
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {cards.map((s) => {
            const featured = !!s.badge_key;
            return (
              <div
                key={s.id}
                className={`relative flex flex-col rounded-[24px] p-7 transition-all hover:-translate-y-1 ${
                  featured
                    ? "border-2 border-primary bg-card shadow-dramatic md:scale-[1.03]"
                    : "border border-border bg-card shadow-soft hover:shadow-elegant"
                }`}
              >
                {featured && s.badge_key && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-4 py-1.5 text-xs font-bold text-amber-950 shadow-elegant">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      {BADGE_COPY[s.badge_key]?.[l] ?? s.badge_key}
                    </div>
                  </div>
                )}

                {/* Tier pill */}
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
                  {s.tier === "ultimate_launch" ? <Crown className="h-3 w-3" /> : null}
                  <span dir="ltr">
                    {TIER_INDEX[s.tier ?? ""] ?? ""} — {tierName(s, l)}
                  </span>
                </div>

                {/* Price — single source of truth via formatFromMAD */}
                {currency.code === "MAD" ? (
                  <>
                    <div className="mt-6 flex items-baseline gap-2" dir="ltr">
                      <span className="text-5xl font-extrabold tracking-tight text-primary">
                        <bdi>{new Intl.NumberFormat("fr-FR").format(s.price_mad ?? 0)}</bdi>
                      </span>
                      <span className="text-lg font-bold text-primary">DH</span>
                    </div>
                    {s.original_price_mad ? (
                      <div className="mt-1 text-sm text-text-3 line-through" dir="ltr">
                        <bdi>{new Intl.NumberFormat("fr-FR").format(s.original_price_mad)}</bdi> DH
                      </div>
                    ) : null}
                  </>
                ) : (
                  <>
                    <div className="mt-6 flex items-baseline gap-2" dir="ltr">
                      <span className="text-5xl font-extrabold tracking-tight text-primary">
                        <bdi>{formatFromMAD(s.price_mad ?? 0)}</bdi>
                      </span>
                      <span className="text-sm font-semibold text-text-3">{currency.code}</span>
                    </div>
                    {s.original_price_mad ? (
                      <div className="mt-1 text-sm text-text-3 line-through" dir="ltr">
                        <bdi>{formatFromMAD(s.original_price_mad)}</bdi>
                      </div>
                    ) : null}
                    <div className="mt-1 text-xs text-text-3" dir="ltr">
                      ≈ <bdi>{formatMAD(s.price_mad ?? 0)}</bdi>
                    </div>
                  </>
                )}

                {/* Delivery */}
                <div className="mt-5 flex items-center gap-2 rounded-lg bg-accent/40 px-3 py-2 text-sm font-semibold text-foreground">
                  <Truck className="h-4 w-4 text-primary" />
                  {l === "ar" ? "التسليم:" : l === "fr" ? "Livraison :" : "Delivery:"} {deliveryLabel(s.delivery_days, l)}
                </div>

                {/* Features */}
                <ul className="mt-5 flex-1 space-y-2.5">
                  {(s.features ?? []).map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-text-2">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      <span>{FEATURE_COPY[f.k]?.[l] ?? f.k}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/start"
                  search={{ plan: s.slug }}
                  className={`mt-7 inline-flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5 ${
                    featured
                      ? "bg-primary text-primary-foreground shadow-elegant"
                      : "bg-foreground text-background hover:shadow-elegant"
                  }`}
                >
                  {featured
                    ? l === "ar"
                      ? "اختار المتكامل"
                      : l === "fr"
                      ? "Choisir l'intégral"
                      : "Choose the complete pack"
                    : l === "ar"
                    ? "ابدأ الآن"
                    : l === "fr"
                    ? "Commencer maintenant"
                    : "Start now"}
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Trust logos */}
      <div className="mt-12 rounded-2xl border border-border bg-card/60 p-6 backdrop-blur">
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm font-bold text-text-2">
          {["Wise", "Mercury", "Payoneer", "Stripe", "PayPal", "Shopify"].map((b) => (
            <span key={b} className="opacity-80">
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
