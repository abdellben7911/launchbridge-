import { Building2, ShoppingBag, Megaphone, Search, CreditCard, Smartphone } from "lucide-react";
import { SectionTag } from "@/components/ui/SectionTag";
import { BentoCard } from "@/components/ui/BentoCard";
import { Reveal } from "@/components/ui/Reveal";
import { useLang } from "@/i18n/LanguageProvider";

export function ServicesBento({ withHeading = true }: { withHeading?: boolean } = {}) {
  const { t, lang } = useLang();
  const copy = {
    en: [
      { i: Building2, t: "US LLC formation", b: "Wyoming or Delaware LLC, EIN, registered agent, US address — all sorted in 24h." },
      { i: ShoppingBag, t: "E-commerce builds", b: "Shopify, custom Next.js, headless. Built for speed and conversion." },
      { i: Megaphone, t: "Paid acquisition", b: "Meta, Google, TikTok. Surgical campaigns with weekly ROI reports." },
      { i: Search, t: "SEO that compounds", b: "Technical audits, content, backlinks. Built to rank on the long tail." },
      { i: CreditCard, t: "Stripe + banking", b: "Mercury, Relay, Wise. Stripe & PayPal activation — even from MEA." },
      { i: Smartphone, t: "Mobile-first funnels", b: "Landing pages, checkout flows, post-purchase loops engineered to convert." },
    ],
    fr: [
      { i: Building2, t: "Création LLC US", b: "Wyoming / Delaware, EIN, agent enregistré, adresse US — réglé en 24h." },
      { i: ShoppingBag, t: "E-commerce sur mesure", b: "Shopify, Next.js, headless. Pensé pour la vitesse et la conversion." },
      { i: Megaphone, t: "Acquisition payante", b: "Meta, Google, TikTok. Campagnes chirurgicales avec rapports ROI hebdo." },
      { i: Search, t: "SEO qui compose", b: "Audits techniques, contenus, backlinks. Pensé pour la longue traîne." },
      { i: CreditCard, t: "Stripe + banque", b: "Mercury, Relay, Wise. Activation Stripe et PayPal — même depuis le MENA." },
      { i: Smartphone, t: "Tunnels mobile-first", b: "Landing, checkout, loops post-achat conçus pour convertir." },
    ],
    ar: [
      { i: Building2, t: "تأسيس LLC أمريكية", b: "Wyoming / Delaware، EIN، وكيل مسجل، عنوان أمريكي — كل ذلك خلال 24 ساعة." },
      { i: ShoppingBag, t: "متاجر إلكترونية", b: "Shopify، Next.js، headless. مصممة للسرعة والتحويل." },
      { i: Megaphone, t: "استحواذ مدفوع", b: "Meta وGoogle وTikTok. حملات دقيقة وتقارير ROI أسبوعية." },
      { i: Search, t: "SEO يتراكم", b: "تدقيق تقني، محتوى، روابط خلفية. للذيل الطويل." },
      { i: CreditCard, t: "Stripe + بنوك", b: "Mercury وRelay وWise. تفعيل Stripe وPayPal من المنطقة." },
      { i: Smartphone, t: "قمعات للجوال", b: "صفحات هبوط، إتمام شراء، حلقات ما بعد البيع للتحويل." },
    ],
  } as const;
  const items = copy[lang];

  return (
    <section id="services" className="mx-auto max-w-7xl px-6 py-24">
      {withHeading && (
        <div className="mx-auto max-w-2xl text-center">
          <SectionTag>{t("services.tag")}</SectionTag>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">{t("services.title")}</h2>
          <p className="mt-4 text-lg text-text-2">{t("services.subtitle")}</p>
        </div>
      )}
      <div className="mt-12 grid grid-cols-12 gap-4">
        {items.map((s, i) => {
          const variant = i === 0 ? "primary" : i === 3 ? "mesh" : i === 4 ? "dark" : "default";
          const span = i === 0 ? "col-span-12 md:col-span-6" : i === 3 ? "col-span-12 md:col-span-6" : "col-span-6 md:col-span-4 lg:col-span-3";
          return (
            <Reveal key={i} delay={i * 0.05} className={span}>
              <BentoCard variant={variant as "primary" | "mesh" | "dark" | "default"} className="flex h-full min-h-[200px] flex-col justify-between">
                <s.i className={`h-7 w-7 ${variant === "primary" || variant === "dark" ? "opacity-90" : "text-primary"}`} />
                <div>
                  <h3 className="mt-6 text-lg font-bold">{s.t}</h3>
                  <p className={`mt-2 text-sm ${variant === "primary" ? "opacity-90" : variant === "dark" ? "opacity-70" : "text-text-2"}`}>{s.b}</p>
                </div>
              </BentoCard>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
