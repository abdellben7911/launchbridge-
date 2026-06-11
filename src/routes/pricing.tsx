import { createFileRoute } from "@tanstack/react-router";
import { LlcPackages } from "@/components/sections/LlcPackages";
import { Faq } from "@/components/sections/Faq";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { PageHero } from "@/components/sections/PageHero";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
  head: () => ({
    meta: [
      { title: "Pricing — LaunchBridge" },
      { name: "description", content: "Transparent plans for US LLC formation and 360° growth packages. State fees billed separately." },
      { property: "og:title", content: "Pricing — LaunchBridge" },
      { property: "og:description", content: "Transparent plans for US LLC formation and 360° growth packages." },
      { property: "og:url", content: "/pricing" },
    ],
    links: [{ rel: "canonical", href: "/pricing" }],
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
