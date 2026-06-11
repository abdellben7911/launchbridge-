import { Briefcase, GraduationCap, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { BentoCard } from "@/components/ui/BentoCard";
import { Reveal } from "@/components/ui/Reveal";
import { useLang } from "@/i18n/LanguageProvider";

export function AgencyAcademy() {
  const { lang } = useLang();
  const copy = {
    en: {
      agency: { t: "Agency pole", h: "Done-for-you growth", b: "LLC formation, web infrastructure, paid acquisition, SEO. End-to-end execution by operators." , cta: "Discover services" },
      academy: { t: "Academy pole", h: "Operator-grade training", b: "Dropshipping, media buying, leadership. Intensive cohorts taught by people who actually ship.", cta: "See programs" },
    },
    fr: {
      agency: { t: "Pôle Agence", h: "Croissance clé en main", b: "Création LLC, infrastructure web, acquisition payante, SEO. Exécution de bout en bout par des opérateurs.", cta: "Voir les services" },
      academy: { t: "Pôle Formation", h: "Formations d'opérateurs", b: "Dropshipping, media buying, leadership. Cohortes intensives par des praticiens.", cta: "Voir les programmes" },
    },
    ar: {
      agency: { t: "قطب الوكالة", h: "نمو منجز بالكامل", b: "تأسيس LLC، بنية ويب، استحواذ مدفوع، SEO. تنفيذ شامل بأيدي مُمارسين.", cta: "اكتشف الخدمات" },
      academy: { t: "قطب التكوين", h: "تكوين بمستوى المُمارسين", b: "دروبشيبينغ، شراء إعلانات، قيادة. دفعات مكثفة يقدمها أشخاص يُنفّذون فعلاً.", cta: "اطلع على البرامج" },
    },
  } as const;
  const c = copy[lang];

  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="grid gap-6 md:grid-cols-2">
        <Reveal>
          <BentoCard variant="primary" className="flex h-full min-h-[320px] flex-col justify-between">
            <Briefcase className="h-9 w-9 opacity-90" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider opacity-80">{c.agency.t}</div>
              <h3 className="mt-2 text-3xl font-extrabold md:text-4xl">{c.agency.h}</h3>
              <p className="mt-3 max-w-md text-sm opacity-90">{c.agency.b}</p>
              <Link to="/services" className="mt-6 inline-flex items-center gap-2 rounded-full bg-background/95 px-5 py-2.5 text-sm font-semibold text-primary hover:bg-background">
                {c.agency.cta} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </div>
          </BentoCard>
        </Reveal>
        <Reveal delay={0.1}>
          <BentoCard variant="dark" className="flex h-full min-h-[320px] flex-col justify-between">
            <GraduationCap className="h-9 w-9 opacity-90" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider opacity-70">{c.academy.t}</div>
              <h3 className="mt-2 text-3xl font-extrabold md:text-4xl">{c.academy.h}</h3>
              <p className="mt-3 max-w-md text-sm opacity-80">{c.academy.b}</p>
              <Link to="/academy" className="mt-6 inline-flex items-center gap-2 rounded-full bg-background px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-background/90">
                {c.academy.cta} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </div>
          </BentoCard>
        </Reveal>
      </div>
    </section>
  );
}
