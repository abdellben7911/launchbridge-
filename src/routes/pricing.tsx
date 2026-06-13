import { createFileRoute } from "@tanstack/react-router";
import { LlcPackages } from "@/components/sections/LlcPackages";
import { Faq } from "@/components/sections/Faq";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { PageHero } from "@/components/sections/PageHero";

const PRICING_FAQ = [
  { q: "What is included in the Basic LLC package?", a: "The Basic package includes US LLC formation, registered agent for 1 year, US address, US phone number, and EIN application. No payment gateways — ideal if you only need the legal entity." },
  { q: "What is included in the Ultimate package?", a: "Everything in Basic plus full onboarding for Stripe (2 accounts), PayPal Business, Mercury Bank, Wise Business, and Payoneer. Starting at 1,799 DH for Montana." },
  { q: "What is the Ultimate Launch package?", a: "Everything in Ultimate plus a fully built Shopify or web store, product setup, and first paid ad campaigns. Designed for founders who want to launch and start selling immediately." },
  { q: "Are state filing fees included in the price?", a: "No. State fees are billed separately: approximately $35 for Montana, $50 for New Mexico, and $100 for Wyoming. These are paid directly to the state." },
  { q: "Which state has the cheapest annual maintenance?", a: "Montana has the lowest annual report fee at $15/year. New Mexico has no annual report at all — only your registered agent fee applies each year." },
  { q: "How do I pay for LaunchBridge services?", a: "Payment is accepted via bank transfer, PayPal, or credit card. All prices are in Moroccan Dirhams (MAD). We also accept payment in USD or EUR at the current exchange rate." },
];

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
  head: () => ({
    meta: [
      { title: "US LLC Formation Pricing — LaunchBridge" },
      { name: "description", content: "Transparent pricing for US LLC formation from Morocco. Basic from 1,299 DH, Ultimate (with Stripe + PayPal) from 1,799 DH. Wyoming, Montana, New Mexico." },
      { property: "og:title", content: "US LLC Formation Pricing — LaunchBridge" },
      { property: "og:description", content: "US LLC formation for MEA founders. Basic from 1,299 DH. Ultimate with Stripe, PayPal, Mercury from 1,799 DH." },
      { property: "og:url", content: "https://launchbridgepro.com/pricing" },
    ],
    links: [{ rel: "canonical", href: "https://launchbridgepro.com/pricing" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "FAQPage",
              "@id": "https://launchbridgepro.com/pricing#faq",
              mainEntity: PRICING_FAQ.map((it) => ({
                "@type": "Question",
                name: it.q,
                acceptedAnswer: { "@type": "Answer", text: it.a },
              })),
            },
            {
              "@type": "ItemList",
              "@id": "https://launchbridgepro.com/pricing#packages",
              name: "US LLC Formation Packages",
              description: "LaunchBridge LLC formation packages for non-US residents",
              itemListElement: [
                {
                  "@type": "ListItem", position: 1,
                  item: {
                    "@type": "Offer",
                    name: "Montana Basic",
                    description: "US LLC formation in Montana with EIN, registered agent, US phone number",
                    price: "1299", priceCurrency: "MAD",
                    seller: { "@id": "https://launchbridgepro.com/#organization" },
                  },
                },
                {
                  "@type": "ListItem", position: 2,
                  item: {
                    "@type": "Offer",
                    name: "Montana Ultimate",
                    description: "Montana LLC + Stripe (×2), PayPal Business, Mercury, Wise, Payoneer",
                    price: "1799", priceCurrency: "MAD",
                    seller: { "@id": "https://launchbridgepro.com/#organization" },
                  },
                },
                {
                  "@type": "ListItem", position: 3,
                  item: {
                    "@type": "Offer",
                    name: "Wyoming Ultimate",
                    description: "Wyoming LLC + full payment gateway stack — the most recognized US entity",
                    price: "2399", priceCurrency: "MAD",
                    seller: { "@id": "https://launchbridgepro.com/#organization" },
                  },
                },
              ],
            },
          ],
        }),
      },
    ],
  }),
});

function PricingPage() {
  return (
    <>
      <PageHero tagKey="pricing.tag" titleKey="pricing.title" subtitleKey="pricing.subtitle" />
      <LlcPackages />
      <Faq />
      <CtaBanner />
    </>
  );
}
