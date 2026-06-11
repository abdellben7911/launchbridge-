import { Shield, ListChecks, Building2, MessageCircleHeart, Activity } from "lucide-react";
import { SectionTag } from "@/components/ui/SectionTag";
import { Reveal } from "@/components/ui/Reveal";
import { useLang } from "@/i18n/LanguageProvider";

const COPY = {
  en: {
    tag: "Our Standard",
    title: "Built for founders at every stage",
    subtitle: "Hundreds of MEA founders trust us to launch and scale internationally — with the same playbook we've refined over years.",
    promiseTitle: "The LaunchBridge Promise",
    promiseList: [
      "If your LLC isn't filed in 72h — full refund.",
      "If Stripe declines your account — we retry, free.",
      "If you're unsatisfied within 14 days — 100% back.",
    ],
    promiseFoot: "No fine print. Our reputation is everything.",
    processTitle: "How we work",
    process: [
      "Discovery call — free, 30 min",
      "Customized roadmap — sent in 24h",
      "You approve — we execute",
      "All docs + logins handed over",
    ],
    stackTitle: "Powered by",
    stack: ["Mercury", "Stripe", "PayPal", "Wise", "Shopify", "Wyoming SOS"],
    stackFoot: "The same infrastructure top operators rely on.",
    founderTitle: "A word from our team",
    founder:
      "We've spent years helping MEA founders open Stripe, form US LLCs, and get paid globally. We learned every trick the hard way — now our clients skip the pain and go straight to launch.",
    founderSign: "— The LaunchBridge Team, Casablanca 🇲🇦",
    statusTitle: "Where we are right now",
    status: [
      "Onboarding new clients · daily",
      "Full legal & tax team · ready",
      "Banking partnerships · active",
      "Avg. response time · < 2 hours",
      "Languages · EN · FR · AR",
    ],
  },
  fr: {
    tag: "Notre standard",
    title: "Conçu pour les fondateurs à chaque étape",
    subtitle: "Des centaines de fondateurs du MENA nous font confiance pour lancer et développer leur activité à l'international — avec une méthode affinée au fil des années.",
    promiseTitle: "La promesse LaunchBridge",
    promiseList: [
      "Si votre LLC n'est pas créée en 72h — remboursement intégral.",
      "Si Stripe refuse votre compte — nous réessayons, gratuitement.",
      "Si vous n'êtes pas satisfait sous 14 jours — 100% remboursé.",
    ],
    promiseFoot: "Aucune clause cachée. Notre réputation est tout.",
    processTitle: "Notre méthode",
    process: [
      "Appel découverte — gratuit, 30 min",
      "Feuille de route personnalisée — sous 24h",
      "Vous validez — nous exécutons",
      "Tous les docs + accès remis",
    ],
    stackTitle: "Propulsé par",
    stack: ["Mercury", "Stripe", "PayPal", "Wise", "Shopify", "Wyoming SOS"],
    stackFoot: "La même infrastructure que les meilleurs opérateurs.",
    founderTitle: "Un mot de notre équipe",
    founder:
      "Nous accompagnons depuis des années des fondateurs du MENA pour ouvrir Stripe, créer une LLC et se faire payer à l'international. Nous avons appris toutes les astuces — nos clients sautent les obstacles et passent directement au lancement.",
    founderSign: "— L'équipe LaunchBridge, Casablanca 🇲🇦",
    statusTitle: "Où nous en sommes",
    status: [
      "Onboarding de nouveaux clients · quotidien",
      "Équipe légale & fiscale · prête",
      "Partenariats bancaires · actifs",
      "Temps de réponse · < 2 heures",
      "Langues · EN · FR · AR",
    ],
  },
  ar: {
    tag: "معاييرنا",
    title: "مصمم لرواد الأعمال في كل مرحلة",
    subtitle: "يثق بنا مئات رواد الأعمال من منطقة الشرق الأوسط وشمال إفريقيا لإطلاق أعمالهم وتوسيعها دولياً — بمنهجية صقلناها عبر السنوات.",
    promiseTitle: "وعد LaunchBridge",
    promiseList: [
      "إذا لم تُؤسَّس LLC خلال 72 ساعة — استرداد كامل.",
      "إذا رفض Stripe حسابك — نعيد المحاولة مجاناً.",
      "إذا لم تكن راضياً خلال 14 يوماً — استرداد 100٪.",
    ],
    promiseFoot: "بلا بنود مخفية. سمعتنا هي كل شيء.",
    processTitle: "كيف نعمل",
    process: [
      "مكالمة استكشافية — مجاناً، 30 دقيقة",
      "خارطة طريق مخصصة — خلال 24 ساعة",
      "أنت توافق — نحن ننفذ",
      "تسليم جميع الوثائق والوصول",
    ],
    stackTitle: "مدعوم بواسطة",
    stack: ["Mercury", "Stripe", "PayPal", "Wise", "Shopify", "Wyoming SOS"],
    stackFoot: "نفس البنية التحتية التي يعتمد عليها أفضل المُمارسين.",
    founderTitle: "كلمة من فريقنا",
    founder:
      "نساعد منذ سنوات رواد الأعمال في المنطقة على فتح Stripe وتأسيس LLC أمريكية واستلام المدفوعات عالمياً. تعلّمنا كل الحيل بالطريقة الصعبة — والآن يتجاوز عملاؤنا العقبات وينطلقون مباشرة.",
    founderSign: "— فريق LaunchBridge، الدار البيضاء 🇲🇦",
    statusTitle: "أين نحن الآن",
    status: [
      "استقبال عملاء جدد · يومياً",
      "فريق قانوني وضريبي كامل · جاهز",
      "شراكات بنكية · نشطة",
      "متوسط زمن الرد · أقل من ساعتين",
      "اللغات · إنجليزية · فرنسية · عربية",
    ],
  },
} as const;


export function EarlyMomentum() {
  const { lang } = useLang();
  const c = COPY[lang];

  return (
    <section id="trust" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <SectionTag>{c.tag}</SectionTag>
        <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">{c.title}</h2>
        <p className="mt-4 text-lg text-text-2">{c.subtitle}</p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-12">


        {/* Promise — col 5 */}
        <Reveal delay={0.05} className="md:col-span-5">
          <div className="h-full rounded-[24px] border border-border bg-card p-7 shadow-bento">
            <Shield className="h-9 w-9 text-primary" />
            <h3 className="mt-4 text-xl font-bold text-foreground">{c.promiseTitle}</h3>
            <ul className="mt-5 space-y-3">
              {c.promiseList.map((p, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-text-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {p}
                </li>
              ))}
            </ul>
            <p className="mt-6 border-t border-border pt-4 text-xs italic text-text-3">{c.promiseFoot}</p>
          </div>
        </Reveal>

        {/* Process — col 4 */}
        <Reveal delay={0.1} className="md:col-span-4">
          <div className="h-full rounded-[24px] border border-border bg-card p-7 shadow-bento">
            <ListChecks className="h-9 w-9 text-primary" />
            <h3 className="mt-4 text-xl font-bold text-foreground">{c.processTitle}</h3>
            <ol className="mt-5 space-y-3">
              {c.process.map((p, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-text-2">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">{i + 1}</span>
                  {p}
                </li>
              ))}
            </ol>
          </div>
        </Reveal>

        {/* Stack — col 3 */}
        <Reveal delay={0.15} className="md:col-span-3">
          <div className="h-full rounded-[24px] bg-foreground p-7 text-background shadow-bento">
            <Building2 className="h-9 w-9 opacity-90" />
            <h3 className="mt-4 text-xl font-bold">{c.stackTitle}</h3>
            <div className="mt-5 grid grid-cols-2 gap-2">
              {c.stack.map((s) => (
                <div key={s} className="rounded-lg bg-background/10 px-2 py-2 text-center text-[11px] font-semibold backdrop-blur">{s}</div>
              ))}
            </div>
            <p className="mt-4 text-[11px] opacity-70">{c.stackFoot}</p>
          </div>
        </Reveal>

        {/* Founder note — col 7 */}
        <Reveal delay={0.05} className="md:col-span-7">
          <div className="h-full rounded-[24px] border-2 border-primary/15 bg-secondary-light/40 p-8 shadow-bento">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-soft">
              <MessageCircleHeart className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-foreground">{c.founderTitle}</h3>
            <p className="mt-4 text-base leading-relaxed text-foreground/85">{c.founder}</p>
            <p className="mt-4 text-sm font-semibold text-foreground">{c.founderSign}</p>
          </div>
        </Reveal>

        {/* Status — col 5 */}
        <Reveal delay={0.1} className="md:col-span-5">
          <div className="h-full rounded-[24px] border border-border bg-card p-7 shadow-bento">
            <div className="flex items-center gap-2">
              <Activity className="h-9 w-9 text-primary" />
              <span className="pulse-dot ms-auto h-2 w-2 rounded-full bg-success" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-foreground">{c.statusTitle}</h3>
            <ul className="mt-5 space-y-3">
              {c.status.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-text-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
