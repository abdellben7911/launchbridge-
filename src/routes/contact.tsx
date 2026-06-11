import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send, MessageCircle, Mail, MapPin } from "lucide-react";
import { PageHero } from "@/components/sections/PageHero";
import { BentoCard } from "@/components/ui/BentoCard";
import { useLang } from "@/i18n/LanguageProvider";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact — LaunchBridge" },
      { name: "description", content: "Tell us about your project. We reply within 12 hours — or skip the form and ping us on WhatsApp." },
      { property: "og:title", content: "Contact — LaunchBridge" },
      { property: "og:description", content: "Tell us about your project." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
});

function ContactPage() {
  const { t } = useLang();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Hi LaunchBridge, I'm ${name} (${email}). ${msg}`;
    const url = `https://wa.me/212619999558?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <>
      <PageHero tagKey="contact.tag" titleKey="contact.title" subtitleKey="contact.subtitle" />
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <BentoCard className="p-8 md:p-10">
              <form onSubmit={submit} className="space-y-5">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-3">{t("contact.name")}</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} required className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-3">{t("contact.email")}</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-3">{t("contact.message")}</label>
                  <textarea value={msg} onChange={(e) => setMsg(e.target.value)} required rows={5} className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary" />
                </div>
                <button type="submit" className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-elegant hover:-translate-y-0.5 transition-all">
                  <Send className="h-4 w-4" /> {t("contact.send")}
                </button>
              </form>
            </BentoCard>
          </div>
          <div className="space-y-4 lg:col-span-2">
            <BentoCard variant="primary">
              <MessageCircle className="h-7 w-7 opacity-90" />
              <h3 className="mt-4 text-lg font-bold">WhatsApp</h3>
              <p className="mt-1 text-sm opacity-90">Fastest channel. Avg reply in 27 min.</p>
              <a href="https://wa.me/212619999558" target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-full bg-background px-4 py-2 text-xs font-semibold text-primary">+212 619 999 558</a>
            </BentoCard>
            <BentoCard>
              <Mail className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-bold">Email</h3>
              <a href="mailto:hello@launchbridge.io" className="mt-1 block text-sm text-text-2 hover:text-primary">hello@launchbridge.io</a>
            </BentoCard>
            <BentoCard variant="dark">
              <MapPin className="h-6 w-6 opacity-90" />
              <h3 className="mt-3 font-bold">Offices</h3>
              <p className="mt-1 text-sm opacity-70">Casablanca · Dubai · Wyoming (US registered agent)</p>
            </BentoCard>
          </div>
        </div>
      </section>
    </>
  );
}
