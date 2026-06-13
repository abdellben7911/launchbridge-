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
import { BookCallBanner } from "@/components/sections/BookCallBanner";

const FAQ_ITEMS = [
  { q: "Can I open a US LLC from Morocco, Algeria, or Tunisia?", a: "Yes. Non-US residents can legally form a US LLC without visiting the United States. LaunchBridge handles the entire process remotely — LLC formation, EIN, US address, and bank account — in as little as 2 days." },
  { q: "How do I get Stripe in Morocco?", a: "Stripe does not support Morocco directly. The legal solution is to form a US LLC, get an EIN, open a US bank account (Mercury), and register Stripe under your US business. LaunchBridge sets this up as part of the Ultimate package." },
  { q: "Which US state is best for a non-resident LLC — Wyoming, Montana, or New Mexico?", a: "Wyoming is the most recognized (2-day formation, strong privacy). Montana is the fastest and cheapest (from 1,299 DH, $15/year maintenance). New Mexico has no annual report. LaunchBridge offers formation in all three states." },
  { q: "Do I need to travel to the US to open a bank account?", a: "No. Mercury Bank, Wise Business, and Relay all accept non-resident LLC owners with no US visit required. LaunchBridge opens these accounts as part of the Ultimate package." },
  { q: "How long does it take to get Stripe and PayPal active?", a: "With the LaunchBridge Ultimate package: LLC formation in 2–7 days depending on state, EIN in 1–3 days, Stripe and PayPal Business onboarding in 2–3 days. Full setup averages 8 business days." },
  { q: "Is owning a US LLC legal for Moroccan residents?", a: "Yes. Moroccan law allows citizens to own foreign businesses. A single-member US LLC owned by a non-resident is treated as a pass-through entity by the IRS — no US corporate tax if you have no US-source income." },
  { q: "How much does it cost to form a US LLC with LaunchBridge?", a: "Packages start at 1,299 DH for the Montana Basic (LLC formation only). The Ultimate package — which includes Stripe, PayPal, Mercury, Wise, and Payoneer — starts at 1,799 DH for Montana, up to 2,399 DH for Wyoming." },
  { q: "Do you work in Arabic and French?", a: "Yes. LaunchBridge operates fully in English, French, and Arabic. All onboarding, support, and documentation are available in all three languages." },
];

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "LaunchBridge — 360° Agency & Academy for MEA founders" },
      { name: "description", content: "Build, sell, and scale internationally from the MEA region. US LLC, conversion web, paid acquisition, and an operator academy." },
      { property: "og:title", content: "LaunchBridge — 360° Agency & Academy for MEA founders" },
      { property: "og:description", content: "Build, sell, and scale internationally from the MEA region. US LLC, conversion web, paid acquisition, and an operator academy." },
      { property: "og:url", content: "https://launchbridgepro.com/" },
      { property: "og:image", content: "https://launchbridgepro.com/og-image.png" },
    ],
    links: [{ rel: "canonical", href: "https://launchbridgepro.com/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "FAQPage",
              "@id": "https://launchbridgepro.com/#faq",
              mainEntity: FAQ_ITEMS.map((it) => ({
                "@type": "Question",
                name: it.q,
                acceptedAnswer: { "@type": "Answer", text: it.a },
              })),
            },
            {
              "@type": "HowTo",
              "@id": "https://launchbridgepro.com/#howto-llc",
              name: "How to Open a US LLC and Get Stripe from Morocco",
              description: "Step-by-step process to form a US LLC as a non-resident, get an EIN, open a US bank account, and activate Stripe and PayPal.",
              totalTime: "P8D",
              estimatedCost: { "@type": "MonetaryAmount", currency: "MAD", value: "1799" },
              step: [
                { "@type": "HowToStep", position: 1, name: "Choose your US state", text: "Select Wyoming (fastest, most recognized), Montana (cheapest), or New Mexico (no annual report) based on your needs and budget." },
                { "@type": "HowToStep", position: 2, name: "Submit your intake form", text: "Provide your name, passport, and business name. LaunchBridge files the Articles of Organization with the state." },
                { "@type": "HowToStep", position: 3, name: "Receive your LLC documents", text: "Get your Certificate of Formation and Operating Agreement within 2–7 business days depending on state." },
                { "@type": "HowToStep", position: 4, name: "Get your EIN", text: "LaunchBridge applies for your US Employer Identification Number (EIN) via IRS Form SS-4. Required for all US financial accounts." },
                { "@type": "HowToStep", position: 5, name: "Open your US bank account", text: "Mercury Bank and Wise Business accounts are opened using your LLC documents and EIN. No US visit required." },
                { "@type": "HowToStep", position: 6, name: "Activate Stripe and PayPal", text: "Register Stripe and PayPal Business accounts under your US LLC. Start accepting international payments immediately." },
              ],
            },
          ],
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
