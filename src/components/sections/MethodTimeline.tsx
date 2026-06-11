import { Scale, LayoutGrid, Rocket } from "lucide-react";
import { SectionTag } from "@/components/ui/SectionTag";
import { Reveal } from "@/components/ui/Reveal";
import { useLang } from "@/i18n/LanguageProvider";

export function MethodTimeline({ withHeading = true }: { withHeading?: boolean } = {}) {
  const { t } = useLang();
  const steps = [
    { n: "01", icon: Scale, t: t("method.s1.t"), b: t("method.s1.b") },
    { n: "02", icon: LayoutGrid, t: t("method.s2.t"), b: t("method.s2.b") },
    { n: "03", icon: Rocket, t: t("method.s3.t"), b: t("method.s3.b") },
  ];

  return (
    <section id="method" className="mx-auto max-w-7xl px-6 py-24">
      {withHeading && (
        <div className="mx-auto max-w-2xl text-center">
          <SectionTag>{t("method.tag")}</SectionTag>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
            {t("method.title")}
          </h2>
          <p className="mt-4 text-lg text-text-2">{t("method.subtitle")}</p>
        </div>
      )}

      <div className="relative mt-14 grid gap-6 md:grid-cols-3">
        {/* connecting line */}
        <div className="pointer-events-none absolute left-0 right-0 top-12 hidden h-px md:block" style={{ background: "linear-gradient(90deg, transparent, color-mix(in oklab, var(--primary) 35%, transparent), transparent)" }} />
        {steps.map((s, i) => (
          <Reveal key={s.n} delay={i * 0.1}>
            <div className="relative h-full rounded-[20px] border border-border bg-card p-7 shadow-bento transition-all hover:-translate-y-1 hover:shadow-dramatic">
              <div className="flex items-center justify-between">
                <span className="font-serif-display text-5xl text-primary/30">{s.n}</span>
                <div className="rounded-full bg-primary/10 p-3 text-primary">
                  <s.icon className="h-5 w-5" />
                </div>
              </div>
              <h3 className="mt-6 text-xl font-bold text-foreground">{s.t}</h3>
              <p className="mt-2 text-sm text-text-2">{s.b}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
