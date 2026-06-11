import { createFileRoute } from "@tanstack/react-router";
import { MethodTimeline } from "@/components/sections/MethodTimeline";
import { PageHero } from "@/components/sections/PageHero";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { BentoCard } from "@/components/ui/BentoCard";
import { Reveal } from "@/components/ui/Reveal";
import { Check } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";

export const Route = createFileRoute("/method")({
  component: MethodPage,
  head: () => ({
    meta: [
      { title: "Our Method — LaunchBridge" },
      { name: "description", content: "A 3-step growth process: legal foundation, digital infrastructure, acquisition & scaling. From idea to empire." },
      { property: "og:title", content: "Our Method — LaunchBridge" },
      { property: "og:description", content: "From idea to empire in three steps." },
      { property: "og:url", content: "/method" },
    ],
    links: [{ rel: "canonical", href: "/method" }],
  }),
});

function MethodPage() {
  const { lang } = useLang();
  const deliverables = {
    en: ["LLC formation in 24h", "EIN + US business address", "Bank account (Mercury/Relay)", "Stripe & PayPal activation", "Conversion-grade website", "Funnel architecture", "Meta + Google + TikTok ads", "Weekly ROI reports", "SEO foundation", "A/B testing infrastructure"],
    fr: ["Création LLC 24h", "EIN + adresse US", "Compte bancaire (Mercury/Relay)", "Activation Stripe & PayPal", "Site web pensé conversion", "Architecture de tunnel", "Pubs Meta + Google + TikTok", "Rapports ROI hebdo", "Fondation SEO", "Infrastructure A/B testing"],
    ar: ["تأسيس LLC في 24 ساعة", "EIN + عنوان أمريكي", "حساب بنكي (Mercury/Relay)", "تفعيل Stripe وPayPal", "موقع مُحسَّن للتحويل", "بنية القمع البيعي", "حملات Meta وGoogle وTikTok", "تقارير ROI أسبوعية", "أساس SEO", "بنية اختبار A/B"],
  }[lang];

  return (
    <>
      <PageHero tagKey="method.tag" titleKey="method.title" subtitleKey="method.subtitle" />
      <MethodTimeline withHeading={false} />
      <section className="mx-auto max-w-5xl px-6 py-16">
        <Reveal>
          <BentoCard variant="mesh" className="p-10">
            <h3 className="text-2xl font-bold">What you actually receive</h3>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {deliverables.map((d, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-text-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{d}</span>
                </div>
              ))}
            </div>
          </BentoCard>
        </Reveal>
      </section>
      <CtaBanner />
    </>
  );
}
