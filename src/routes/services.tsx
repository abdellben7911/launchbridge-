import { createFileRoute } from "@tanstack/react-router";
import { ServicesBento } from "@/components/sections/ServicesBento";
import { MethodTimeline } from "@/components/sections/MethodTimeline";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { BookCallBanner } from "@/components/sections/BookCallBanner";
import { PageHero } from "@/components/sections/PageHero";

export const Route = createFileRoute("/services")({
  component: ServicesPage,
  head: () => ({
    meta: [
      { title: "Services — LaunchBridge 360° Agency" },
      { name: "description", content: "LLC formation, e-commerce builds, paid acquisition, SEO, banking & Stripe activation — done by operators." },
      { property: "og:title", content: "Services — LaunchBridge" },
      { property: "og:description", content: "LLC, e-commerce, ads, SEO, Stripe — done by operators." },
      { property: "og:url", content: "/services" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
});

function ServicesPage() {
  return (
    <>
      <PageHero tagKey="services.tag" titleKey="services.title" subtitleKey="services.subtitle" />
      <ServicesBento withHeading={false} />
      <MethodTimeline withHeading={false} />
      <BookCallBanner />
      <CtaBanner />
    </>
  );
}
