import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/sections/Hero";
import { TrustBar } from "@/components/sections/TrustBar";
import { AgencyAcademy } from "@/components/sections/AgencyAcademy";
import { MethodTimeline } from "@/components/sections/MethodTimeline";
import { ServicesBento } from "@/components/sections/ServicesBento";
import { CountriesGrid } from "@/components/sections/CountriesGrid";
import { EarlyMomentum } from "@/components/sections/EarlyMomentum";
import { TestimonialsBento } from "@/components/sections/TestimonialsBento";
import { Faq } from "@/components/sections/Faq";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { LlcPackages } from "@/components/sections/LlcPackages";

const FAQ_ITEMS = [
  { q: "How long does the full launch take?", a: "Legal foundation in 24–72h. A full e-com infrastructure + first paid campaigns in 14–28 days, depending on scope." },
  { q: "Do I need to fly to the US?", a: "No. Everything is 100% remote — LLC, EIN, bank, Stripe, everything." },
  { q: "Can I run my Stripe from anywhere in MEA?", a: "Yes. Once your US LLC has an EIN and a US business bank account, Stripe activates worldwide." },
  { q: "How do you charge?", a: "Setup packages for the foundation, monthly retainers for marketing & SEO, performance fees for paid ads only when you scale." },
  { q: "Do you work in Arabic and French?", a: "Yes. Full team operates in English, French, and Arabic." },
  { q: "What guarantees do you offer?", a: "Refund of our service fees if we don't deliver the LLC + bank + Stripe in 30 days. Performance guarantees on paid ads after audit." },
];

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "LaunchBridge — 360° Agency & Academy for MEA founders" },
      { name: "description", content: "Build, sell, and scale internationally from the MEA region. US LLC, conversion web, paid acquisition, and an operator academy." },
      { property: "og:title", content: "LaunchBridge — 360° Agency & Academy for MEA founders" },
      { property: "og:description", content: "Build, sell, and scale internationally from the MEA region. US LLC, conversion web, paid acquisition, and an operator academy." },
      { property: "og:url", content: "https://launchbridgepro.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://launchbridgepro.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ_ITEMS.map((it) => ({
            "@type": "Question",
            name: it.q,
            acceptedAnswer: { "@type": "Answer", text: it.a },
          })),
        }),
      },
    ],
  }),
});


function Home() {
  return (
    <>
      <Hero />
      <TrustBar />
      <AgencyAcademy />
      <MethodTimeline />
      <ServicesBento />
      <LlcPackages />
      <EarlyMomentum />
      <CountriesGrid compact />
      <TestimonialsBento />
      <Faq />
      <CtaBanner />
    </>
  );
}
