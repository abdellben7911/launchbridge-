import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SectionTag } from "@/components/ui/SectionTag";
import { useLang } from "@/i18n/LanguageProvider";

export function Faq() {
  const { t, lang } = useLang();
  const items = {
    en: [
      { q: "How long does the full launch take?", a: "Legal foundation in 24–72h. A full e-com infrastructure + first paid campaigns in 14–28 days, depending on scope." },
      { q: "Do I need to fly to the US?", a: "No. Everything is 100% remote — LLC, EIN, bank, Stripe, everything." },
      { q: "Can I run my Stripe from anywhere in MEA?", a: "Yes. Once your US LLC has an EIN and a US business bank account, Stripe activates worldwide." },
      { q: "How do you charge?", a: "Setup packages for the foundation, monthly retainers for marketing & SEO, performance fees for paid ads only when you scale." },
      { q: "Do you work in Arabic and French?", a: "Yes. Full team operates in English, French, and Arabic." },
      { q: "What guarantees do you offer?", a: "Refund of our service fees if we don't deliver the LLC + bank + Stripe in 30 days. Performance guarantees on paid ads after audit." },
    ],
    fr: [
      { q: "Combien de temps prend un lancement complet ?", a: "Fondation légale en 24–72h. Infrastructure e-com complète + premières campagnes en 14–28 jours selon le scope." },
      { q: "Dois-je voyager aux USA ?", a: "Non. Tout est 100% à distance — LLC, EIN, banque, Stripe, tout." },
      { q: "Stripe fonctionne depuis le MENA ?", a: "Oui. Avec une LLC US, un EIN et un compte bancaire US, Stripe s'active partout." },
      { q: "Comment se passe la facturation ?", a: "Packages setup pour la fondation, retainers mensuels marketing & SEO, fees de performance sur le payant au scale." },
      { q: "Vous parlez arabe et français ?", a: "Oui. L'équipe opère en anglais, français et arabe." },
      { q: "Quelles garanties ?", a: "Remboursement si LLC + banque + Stripe non livrés en 30 jours. Garanties de performance sur le payant après audit." },
    ],
    ar: [
      { q: "كم يستغرق الإطلاق الكامل؟", a: "الأساس القانوني خلال 24–72 ساعة. بنية e-com كاملة وأولى الحملات خلال 14–28 يوماً." },
      { q: "هل أحتاج للسفر إلى أمريكا؟", a: "لا. كل شيء عن بعد 100٪." },
      { q: "هل يعمل Stripe من المنطقة؟", a: "نعم. مع LLC أمريكية وEIN وحساب بنكي أمريكي، يعمل Stripe من أي مكان." },
      { q: "كيف تتم الفوترة؟", a: "باقات تأسيس، اشتراكات شهرية للتسويق وSEO، ورسوم أداء على الإعلانات المدفوعة عند التوسع." },
      { q: "هل تعملون بالعربية والفرنسية؟", a: "نعم. الفريق يعمل بالإنجليزية والفرنسية والعربية." },
      { q: "ما هي الضمانات؟", a: "استرداد الرسوم إن لم نُسلّم LLC + بنك + Stripe خلال 30 يوماً. ضمانات أداء على الإعلانات بعد التدقيق." },
    ],
  }[lang];

  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
      <div className="text-center">
        <SectionTag>{t("faq.tag")}</SectionTag>
        <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">{t("faq.title")}</h2>
      </div>
      <Accordion type="single" collapsible className="mt-10 space-y-3">
        {items.map((it, i) => (
          <AccordionItem key={i} value={`i${i}`} className="overflow-hidden rounded-[18px] border border-border bg-card px-6">
            <AccordionTrigger className="py-5 text-start text-base font-semibold hover:no-underline">{it.q}</AccordionTrigger>
            <AccordionContent className="pb-5 text-sm text-text-2">{it.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
