import { createFileRoute } from "@tanstack/react-router";
import { Users, Globe, Heart, Zap } from "lucide-react";
import { PageHero } from "@/components/sections/PageHero";
import { BentoCard } from "@/components/ui/BentoCard";
import { Reveal } from "@/components/ui/Reveal";
import { StatCounter } from "@/components/ui/StatCounter";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { useLang } from "@/i18n/LanguageProvider";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About — LaunchBridge" },
      { name: "description", content: "We're a team of operators — designers, growth marketers, US legal specialists — building predictable revenue for ambitious MEA founders." },
      { property: "og:title", content: "About — LaunchBridge" },
      { property: "og:description", content: "We're operators. We ship." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
});

function AboutPage() {
  const { lang } = useLang();
  const values = {
    en: [
      { i: Zap, t: "Speed beats perfection", b: "Ship in 24h, iterate in public, learn from data — not from opinions." },
      { i: Heart, t: "Outcomes over outputs", b: "We're measured by your revenue, not by hours billed or slides delivered." },
      { i: Users, t: "Operator > guru", b: "Every team member has shipped, sold, scaled, or invested at scale." },
      { i: Globe, t: "Built for MEA", b: "Local context, global ambition. We speak Arabic, French, English — and ROAS." },
    ],
    fr: [
      { i: Zap, t: "Vitesse > perfection", b: "Livrer en 24h, itérer en public, apprendre des données." },
      { i: Heart, t: "Résultats > livrables", b: "Mesurés sur votre revenu, pas les heures facturées." },
      { i: Users, t: "Opérateur > gourou", b: "Chaque membre a livré, vendu, scalé ou investi à grande échelle." },
      { i: Globe, t: "Pensé pour le MENA", b: "Contexte local, ambition globale. Arabe, français, anglais — et ROAS." },
    ],
    ar: [
      { i: Zap, t: "السرعة تتفوق على الكمال", b: "نُطلق في 24 ساعة، نُحسّن علناً، نتعلم من البيانات." },
      { i: Heart, t: "النتائج أهم من المخرجات", b: "نُقاس بإيراداتك، لا بالساعات المُحاسبة." },
      { i: Users, t: "مُمارس أهم من مدّعي", b: "كل عضو في الفريق نفّذ وباع ونمّى أو استثمر بحجم." },
      { i: Globe, t: "مصمَّم للمنطقة", b: "سياق محلي وطموح عالمي. عربي وفرنسي وإنجليزي — وROAS." },
    ],
  }[lang];

  return (
    <>
      <PageHero tagKey="about.tag" titleKey="about.title" subtitleKey="about.subtitle" />
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <BentoCard className="h-full">
                <v.i className="h-6 w-6 text-primary" />
                <h2 className="mt-4 text-lg font-bold">{v.t}</h2>
                <p className="mt-2 text-sm text-text-2">{v.b}</p>
              </BentoCard>
            </Reveal>
          ))}
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <Reveal>
            <BentoCard variant="primary" className="min-h-[180px]">
              <div className="text-xs font-bold uppercase tracking-wider opacity-80">Since 2022</div>
              <div className="mt-3 font-serif-display text-6xl"><StatCounter to={500} suffix="+" /></div>
              <div className="mt-1 text-sm opacity-90">Founders served</div>
            </BentoCard>
          </Reveal>
          <Reveal delay={0.1}>
            <BentoCard variant="mesh" className="min-h-[180px]">
              <div className="text-xs font-bold uppercase tracking-wider text-text-3">Generated</div>
              <div className="mt-3 font-serif-display text-6xl text-primary">€<StatCounter to={42} />M+</div>
              <div className="mt-1 text-sm text-text-2">For clients across MEA</div>
            </BentoCard>
          </Reveal>
          <Reveal delay={0.2}>
            <BentoCard variant="dark" className="min-h-[180px]">
              <div className="text-xs font-bold uppercase tracking-wider opacity-70">Across</div>
              <div className="mt-3 font-serif-display text-6xl"><StatCounter to={30} suffix="+" /></div>
              <div className="mt-1 text-sm opacity-80">Countries & territories</div>
            </BentoCard>
          </Reveal>
        </div>
      </section>
      <CtaBanner />
    </>
  );
}
