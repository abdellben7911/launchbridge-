import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap, Rocket, Crown, Calendar, Users, Award, CheckCircle2, Download, MessageCircle } from "lucide-react";
import { PageHero } from "@/components/sections/PageHero";
import { MediaCarousel } from "@/components/ui/MediaCarousel";
import { BentoCard } from "@/components/ui/BentoCard";
import { Reveal } from "@/components/ui/Reveal";
import { SectionTag } from "@/components/ui/SectionTag";
import { Flag3D } from "@/components/ui/Flag3D";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { useLang } from "@/i18n/LanguageProvider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/academy")({
  component: AcademyPage,
  head: () => ({
    meta: [
      { title: "Academy — LaunchBridge" },
      { name: "description", content: "Operator-grade programs in dropshipping, media buying, and leadership. Taught by people who actually ship." },
      { property: "og:title", content: "Academy — LaunchBridge" },
      { property: "og:description", content: "Operator-grade training: dropshipping, media buying, leadership." },
      { property: "og:url", content: "/academy" },
    ],
    links: [{ rel: "canonical", href: "/academy" }],
  }),
});

type Locale = "en" | "fr" | "ar";

const PROGRAMS = {
  en: [
    { icon: Rocket, name: "Dropshipping Mastery", weeks: "8 weeks · live cohort", price: "$1,200", color: "from-emerald-500/20 to-cyan-500/20", desc: "Find winning products, build conversion stores, launch your first $10K month.", curriculum: ["Niche & product research frameworks", "Supplier vetting + sourcing", "Shopify build + conversion theme", "Creative testing on Meta & TikTok", "Scaling to 4-figure days", "Customer service ops", "Brand transition strategy", "Final pitch + 1:1 review"] },
    { icon: GraduationCap, name: "Media Buying Pro", weeks: "10 weeks · live cohort", price: "$1,800", color: "from-violet-500/20 to-fuchsia-500/20", desc: "Meta, Google, TikTok at scale. From $50/day budgets to managing 6-figure spends.", curriculum: ["Pixel & event setup, CAPI", "Account structure for scale", "Creative testing matrix", "Audience research & retargeting", "Google Search & PMax", "TikTok Spark Ads", "Attribution & MMM basics", "Budget pacing & dayparting", "Reporting dashboards", "Capstone audit"] },
    { icon: Crown, name: "Founder Leadership", weeks: "6 weeks · executive", price: "$2,400", color: "from-amber-500/20 to-rose-500/20", desc: "Hiring, delegation, ops. Move from solo operator to running a 10-person team.", curriculum: ["Founder time audit", "Org design 1-10 people", "Hiring & filtering loop", "Delegation by outcomes (RACI)", "SOPs & weekly cadence", "Founder mental load"] },
  ],
  fr: [
    { icon: Rocket, name: "Maîtrise Dropshipping", weeks: "8 semaines · cohorte live", price: "1 200 $", color: "from-emerald-500/20 to-cyan-500/20", desc: "Trouvez des produits gagnants, construisez des boutiques qui convertissent, atteignez 10K$/mois.", curriculum: ["Recherche niche & produit", "Sélection fournisseurs", "Boutique Shopify orientée conversion", "Tests créatifs Meta & TikTok", "Scaling jusqu'à 4 chiffres/jour", "Service client", "Transition vers marque", "Pitch final + 1:1"] },
    { icon: GraduationCap, name: "Media Buying Pro", weeks: "10 semaines · cohorte live", price: "1 800 $", color: "from-violet-500/20 to-fuchsia-500/20", desc: "Meta, Google, TikTok à l'échelle. De 50$/jour à 6 chiffres mensuels.", curriculum: ["Setup Pixel & CAPI", "Structure compte pour scale", "Matrice tests créatifs", "Audience & retargeting", "Google Search & PMax", "TikTok Spark Ads", "Attribution & MMM", "Pacing budget", "Dashboards reporting", "Audit final"] },
    { icon: Crown, name: "Leadership Fondateur", weeks: "6 semaines · executive", price: "2 400 $", color: "from-amber-500/20 to-rose-500/20", desc: "Recrutement, délégation, ops. Du solo à une équipe de 10.", curriculum: ["Audit temps fondateur", "Org design 1-10", "Recrutement & filtrage", "Délégation par résultats", "SOPs & cadence hebdo", "Charge mentale fondateur"] },
  ],
  ar: [
    { icon: Rocket, name: "إتقان الدروبشيبينغ", weeks: "8 أسابيع · دفعة مباشرة", price: "$1,200", color: "from-emerald-500/20 to-cyan-500/20", desc: "اعثر على المنتجات الرابحة، ابنِ متاجر تحويلية، حقق أول 10 آلاف دولار شهرياً.", curriculum: ["أُطر بحث النيتش والمنتج", "تقييم الموردين", "بناء Shopify بتركيز التحويل", "اختبار الإبداع على Meta وTikTok", "التوسع لأرقام يومية رباعية", "عمليات خدمة العملاء", "الانتقال إلى علامة تجارية", "العرض النهائي + جلسة 1:1"] },
    { icon: GraduationCap, name: "Media Buying احترافي", weeks: "10 أسابيع · دفعة مباشرة", price: "$1,800", color: "from-violet-500/20 to-fuchsia-500/20", desc: "Meta وGoogle وTikTok على نطاق واسع. من 50$ يومياً إلى 6 أرقام شهرياً.", curriculum: ["إعداد Pixel وCAPI", "هيكلة الحساب للتوسع", "مصفوفة اختبار الإبداع", "بحث الجمهور وإعادة الاستهداف", "Google Search وPMax", "TikTok Spark Ads", "الإسناد وأساسيات MMM", "ضبط الميزانية", "لوحات التقارير", "تدقيق نهائي"] },
    { icon: Crown, name: "قيادة المؤسسين", weeks: "6 أسابيع · تنفيذي", price: "$2,400", color: "from-amber-500/20 to-rose-500/20", desc: "التوظيف، التفويض، العمليات. من العمل منفرداً إلى فريق من 10 أشخاص.", curriculum: ["تدقيق وقت المؤسس", "تصميم المؤسسة 1-10", "حلقة التوظيف والتصفية", "التفويض بالنتائج", "إجراءات تشغيل وإيقاع أسبوعي", "العبء الذهني للمؤسس"] },
  ],
} as const;

const INSTRUCTORS = {
  en: [
    { name: "Yassine El Amrani", role: "Lead Instructor · Dropshipping", bio: "$18M+ generated. Built and exited 2 DTC brands.", initials: "YE" },
    { name: "Sophie Martin", role: "Lead Instructor · Media Buying", bio: "Ex-Meta agency lead. Manages $4M/month in ad spend.", initials: "SM" },
    { name: "Karim Hassan", role: "Lead Instructor · Leadership", bio: "Scaled a remote team from 2 to 47 in 18 months.", initials: "KH" },
  ],
  fr: [
    { name: "Yassine El Amrani", role: "Instructeur · Dropshipping", bio: "18M$+ générés. 2 marques DTC construites et revendues.", initials: "YE" },
    { name: "Sophie Martin", role: "Instructrice · Media Buying", bio: "Ex-lead agence Meta. Gère 4M$/mois en ads.", initials: "SM" },
    { name: "Karim Hassan", role: "Instructeur · Leadership", bio: "Équipe remote de 2 à 47 en 18 mois.", initials: "KH" },
  ],
  ar: [
    { name: "ياسين العمراني", role: "المدرب الرئيسي · الدروبشيبينغ", bio: "أكثر من 18 مليون $ تم تحقيقها. بنى وباع علامتين تجاريتين.", initials: "YE" },
    { name: "صوفي مارتن", role: "المدربة الرئيسية · Media Buying", bio: "قائدة سابقة في وكالة Meta. تدير 4 مليون $ شهرياً.", initials: "SM" },
    { name: "كريم حسن", role: "المدرب الرئيسي · القيادة", bio: "وسّع فريقاً عن بُعد من 2 إلى 47 خلال 18 شهراً.", initials: "KH" },
  ],
} as const;

const COHORTS = {
  en: [
    { date: "Sep 15, 2026", program: "Dropshipping Mastery", seats: 6 },
    { date: "Sep 29, 2026", program: "Media Buying Pro", seats: 4 },
    { date: "Oct 13, 2026", program: "Founder Leadership", seats: 9 },
  ],
  fr: [
    { date: "15 sept. 2026", program: "Maîtrise Dropshipping", seats: 6 },
    { date: "29 sept. 2026", program: "Media Buying Pro", seats: 4 },
    { date: "13 oct. 2026", program: "Leadership Fondateur", seats: 9 },
  ],
  ar: [
    { date: "15 سبتمبر 2026", program: "إتقان الدروبشيبينغ", seats: 6 },
    { date: "29 سبتمبر 2026", program: "Media Buying احترافي", seats: 4 },
    { date: "13 أكتوبر 2026", program: "قيادة المؤسسين", seats: 9 },
  ],
} as const;

const ALUMNI = {
  en: [
    { name: "Amine R.", country: "ma", revenue: "$420K", quote: "Went from zero ecom to $40K months in 6 months." },
    { name: "Fatima K.", country: "sa", revenue: "$680K", quote: "The media buying playbook paid for itself in week 3." },
    { name: "Tunde A.", country: "ng", revenue: "$1.2M", quote: "Now running a 12-person team. Started this course solo." },
  ],
  fr: [
    { name: "Amine R.", country: "ma", revenue: "420K $", quote: "Passé de zéro à 40K$/mois en 6 mois." },
    { name: "Fatima K.", country: "sa", revenue: "680K $", quote: "Le playbook média s'est rentabilisé en 3 semaines." },
    { name: "Tunde A.", country: "ng", revenue: "1,2M $", quote: "Maintenant une équipe de 12. J'ai commencé seul." },
  ],
  ar: [
    { name: "أمين ر.", country: "ma", revenue: "420 ألف $", quote: "من الصفر إلى 40 ألف $ شهرياً في 6 أشهر." },
    { name: "فاطمة ك.", country: "sa", revenue: "680 ألف $", quote: "خطة Media Buying سددت تكلفتها في الأسبوع الثالث." },
    { name: "توندي أ.", country: "ng", revenue: "1.2 مليون $", quote: "أُدير الآن فريقاً من 12 شخصاً، بدأت وحدي." },
  ],
} as const;

const FAQS = {
  en: [
    { q: "Do I need experience?", a: "No prior business experience required. Strong English or French recommended; Arabic-language office hours offered weekly." },
    { q: "How much time per week?", a: "Plan for 6–10 hours/week: 2 live sessions, recorded modules, and homework." },
    { q: "Is there a refund policy?", a: "Yes — 14-day full refund if you complete the first two modules and feel the program isn't for you." },
    { q: "Do I get a certificate?", a: "Yes, a LaunchBridge Academy completion certificate, plus alumni network access for life." },
  ],
  fr: [
    { q: "Faut-il de l'expérience ?", a: "Aucune expérience requise. Anglais ou français recommandés ; permanences en arabe chaque semaine." },
    { q: "Combien d'heures par semaine ?", a: "Prévoyez 6 à 10h/semaine : 2 sessions live, modules enregistrés et devoirs." },
    { q: "Politique de remboursement ?", a: "Oui — remboursement complet sous 14 jours si vous terminez les 2 premiers modules." },
    { q: "Y a-t-il un certificat ?", a: "Oui, un certificat LaunchBridge Academy + accès à vie au réseau alumni." },
  ],
  ar: [
    { q: "هل أحتاج خبرة سابقة؟", a: "لا تُشترط خبرة. يُفضّل إنجليزية أو فرنسية جيدة، وتتوفر ساعات مكتبية بالعربية أسبوعياً." },
    { q: "كم ساعة أسبوعياً؟", a: "خطط لـ 6–10 ساعات: جلستان مباشرتان، وحدات مسجلة، وواجبات." },
    { q: "هل يوجد سياسة استرداد؟", a: "نعم — استرداد كامل خلال 14 يوماً إذا أكملت أول وحدتين ولم يناسبك البرنامج." },
    { q: "هل أحصل على شهادة؟", a: "نعم، شهادة إتمام من LaunchBridge Academy + وصول مدى الحياة لشبكة الخريجين." },
  ],
} as const;

function AcademyPage() {
  const { lang, t } = useLang();
  const l = lang as Locale;
  const programs = PROGRAMS[l];
  const instructors = INSTRUCTORS[l];
  const cohorts = COHORTS[l];
  const alumni = ALUMNI[l];
  const faqs = FAQS[l];

  return (
    <>
      <PageHero tagKey="academy.tag" titleKey="academy.title" subtitleKey="academy.subtitle" />

      {/* Programs */}
      <section className="mx-auto max-w-7xl px-6 pb-12">
        <MediaCarousel>
          {programs.map((p, i) => (
            <BentoCard key={i} variant="default" className={`h-full min-h-[440px] bg-gradient-to-br ${p.color}`}>
              <p.icon className="h-8 w-8 text-primary" />
              <h3 className="mt-6 text-2xl font-extrabold text-foreground">{p.name}</h3>
              <div className="mt-1 text-xs font-semibold text-text-3 uppercase tracking-wider">{p.weeks}</div>
              <p className="mt-5 text-sm text-text-2">{p.desc}</p>
              <div className="mt-8 flex items-end justify-between">
                <div>
                  <div className="font-serif-display text-4xl text-primary">{p.price}</div>
                  <div className="text-xs text-text-3">{l === "fr" ? "Paiement unique" : l === "ar" ? "دفعة واحدة" : "One-time, lifetime access"}</div>
                </div>
                <a href="#cohorts" className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:-translate-y-0.5 transition-all">
                  {l === "fr" ? "S'inscrire" : l === "ar" ? "سجّل" : "Enroll"} →
                </a>
              </div>
            </BentoCard>
          ))}
        </MediaCarousel>
      </section>

      {/* Curriculum */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="text-center">
          <SectionTag>{l === "fr" ? "Programme" : l === "ar" ? "المنهج" : "Curriculum"}</SectionTag>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">
            {l === "fr" ? "Ce que vous apprendrez, semaine par semaine" : l === "ar" ? "ما ستتعلمه أسبوعاً بأسبوع" : "What you learn, week by week"}
          </h2>
        </div>
        <Accordion type="single" collapsible className="mt-10 space-y-3">
          {programs.map((p, i) => (
            <AccordionItem key={i} value={`p${i}`} className="rounded-2xl border border-border bg-card px-5">
              <AccordionTrigger className="text-left hover:no-underline">
                <div className="flex items-center gap-3">
                  <p.icon className="h-5 w-5 text-primary" />
                  <span className="font-bold">{p.name}</span>
                  <span className="ms-2 text-xs text-text-3">{p.weeks}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ol className="grid gap-2 ps-1 sm:grid-cols-2">
                  {p.curriculum.map((m, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-text-2">
                      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{idx + 1}</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ol>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Instructors */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="text-center">
          <SectionTag>{l === "fr" ? "Instructeurs" : l === "ar" ? "المدربون" : "Instructors"}</SectionTag>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">
            {l === "fr" ? "Des opérateurs, pas des coachs" : l === "ar" ? "ممارسون فعليون، لا مدربون نظريون" : "Operators, not coaches"}
          </h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {instructors.map((p, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <BentoCard className="h-full">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-primary-foreground" style={{ backgroundImage: "var(--gradient-hero)" }}>
                    {p.initials}
                  </div>
                  <div>
                    <div className="font-bold">{p.name}</div>
                    <div className="text-xs text-text-3">{p.role}</div>
                  </div>
                </div>
                <p className="mt-4 text-sm text-text-2">{p.bio}</p>
              </BentoCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Cohort schedule */}
      <section id="cohorts" className="mx-auto max-w-5xl px-6 py-16">
        <div className="text-center">
          <SectionTag>{l === "fr" ? "Prochaines cohortes" : l === "ar" ? "الدفعات القادمة" : "Upcoming cohorts"}</SectionTag>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">
            {l === "fr" ? "Démarrages live" : l === "ar" ? "بدايات مباشرة" : "Live start dates"}
          </h2>
        </div>
        <div className="mt-10 grid gap-3">
          {cohorts.map((c, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40">
                <Calendar className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <div className="text-sm font-semibold">{c.program}</div>
                  <div className="text-xs text-text-3">{c.date}</div>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  <Users className="h-3 w-3" />
                  {c.seats} {l === "fr" ? "places restantes" : l === "ar" ? "مقعد متبقي" : "seats left"}
                </div>
                <a href="/contact" className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:-translate-y-0.5 transition-all">
                  {l === "fr" ? "Réserver" : l === "ar" ? "احجز" : "Reserve"} →
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Alumni outcomes */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="text-center">
          <SectionTag>{l === "fr" ? "Résultats alumni" : l === "ar" ? "نتائج الخريجين" : "Alumni outcomes"}</SectionTag>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">
            {l === "fr" ? "Ce qu'ils ont construit" : l === "ar" ? "ما الذي بنوه" : "What they built"}
          </h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {alumni.map((a, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <BentoCard variant={i === 1 ? "primary" : "default"} className="h-full">
                <div className="flex items-center gap-3">
                  <Flag3D code={a.country} size="sm" />
                  <div className="font-bold">{a.name}</div>
                </div>
                <div className="mt-5 font-serif-display text-4xl">{a.revenue}</div>
                <div className={`text-xs ${i === 1 ? "opacity-80" : "text-text-3"}`}>
                  {l === "fr" ? "Revenu généré" : l === "ar" ? "إيرادات محققة" : "Revenue generated"}
                </div>
                <p className={`mt-4 text-sm ${i === 1 ? "opacity-90" : "text-text-2"}`}>"{a.quote}"</p>
              </BentoCard>
            </Reveal>
          ))}
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {[
            { v: "2,400+", l: l === "fr" ? "Alumni" : l === "ar" ? "خريج" : "Alumni" },
            { v: "92%", l: l === "fr" ? "Taux de complétion" : l === "ar" ? "نسبة الإتمام" : "Completion rate" },
            { v: "4.9/5", l: l === "fr" ? "Note de cohorte" : l === "ar" ? "تقييم الدفعة" : "Cohort rating" },
            { v: "$8.4M", l: l === "fr" ? "Généré par alumni" : l === "ar" ? "حققها الخريجون" : "Generated by alumni" },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <BentoCard className="text-center">
                <div className="font-serif-display text-4xl text-primary">{s.v}</div>
                <div className="mt-1 text-xs uppercase tracking-wider text-text-3">{s.l}</div>
              </BentoCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="text-center">
          <SectionTag>FAQ</SectionTag>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">
            {l === "fr" ? "Vos questions" : l === "ar" ? "أسئلتكم" : "Common questions"}
          </h2>
        </div>
        <Accordion type="single" collapsible className="mt-8 space-y-3">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`f${i}`} className="rounded-2xl border border-border bg-card px-5">
              <AccordionTrigger className="text-left hover:no-underline">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-semibold">{f.q}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-text-2">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Sticky bottom CTA */}
      <div className="sticky bottom-4 z-20 mx-auto mb-8 flex max-w-3xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-popover/90 px-5 py-3 shadow-dramatic backdrop-blur supports-[backdrop-filter]:bg-popover/70">
        <div className="flex items-center gap-2 text-sm">
          <Award className="h-4 w-4 text-primary" />
          <span className="font-semibold">
            {l === "fr" ? "Prêt à rejoindre la prochaine cohorte ?" : l === "ar" ? "هل أنت مستعد للانضمام للدفعة القادمة؟" : "Ready to join the next cohort?"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a href="/contact" className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-2 text-xs font-semibold hover:border-primary/50">
            <MessageCircle className="h-3.5 w-3.5" />
            {l === "fr" ? "Conseiller" : l === "ar" ? "تحدّث مع مستشار" : "Talk to advisor"}
          </a>
          <a href="/contact" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:-translate-y-0.5 transition-all">
            <Download className="h-3.5 w-3.5" />
            {l === "fr" ? "Syllabus" : l === "ar" ? "تحميل المنهج" : "Download syllabus"}
          </a>
        </div>
      </div>

      <CtaBanner />
    </>
  );
}
