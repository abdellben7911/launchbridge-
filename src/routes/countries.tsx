import { createFileRoute } from "@tanstack/react-router";
import { CountriesGrid } from "@/components/sections/CountriesGrid";
import { PageHero } from "@/components/sections/PageHero";
import { CtaBanner } from "@/components/sections/CtaBanner";

export const Route = createFileRoute("/countries")({
  component: CountriesPage,
  head: () => ({
    meta: [
      { title: "Markets we serve — LaunchBridge" },
      { name: "description", content: "From Casablanca to Lagos, Riyadh to Nairobi. We serve ambitious founders across 30+ countries in the MEA region." },
      { property: "og:title", content: "Markets we serve — LaunchBridge" },
      { property: "og:description", content: "Founders across 30+ countries trust LaunchBridge." },
      { property: "og:url", content: "/countries" },
    ],
    links: [{ rel: "canonical", href: "/countries" }],
  }),
});

function CountriesPage() {
  return (
    <>
      <PageHero tagKey="countries.tag" titleKey="countries.title" subtitleKey="countries.subtitle" />
      <CountriesGrid withHeading={false} />
      <CtaBanner />
    </>
  );
}
