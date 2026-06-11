import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { COUNTRIES, US_STATES } from "@/lib/saas-constants";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useLang } from "@/i18n/LanguageProvider";

const INDUSTRIES = [
  "E-commerce",
  "SaaS / Software",
  "Digital marketing",
  "Consulting",
  "Freelance services",
  "Dropshipping",
  "Content creation / Media",
  "Education / Coaching",
  "Real estate",
  "Import / Export",
  "Health & wellness",
  "Finance / Fintech",
  "Other",
] as const;

export const Route = createFileRoute("/start")({
  validateSearch: (s) => ({ plan: (s.plan as string) ?? "" }),
  head: () => ({ meta: [{ title: "Start your LLC dossier — LaunchBridge" }] }),
  component: StartPage,
});

const BizSchema = z.object({
  business_name: z.string().min(2).max(120),
  industry: z.string().min(2).max(120),
  us_state: z.string().min(2).max(40),
  business_desc: z.string().max(1000).optional(),
});

const AcctSchema = z.object({
  full_name: z.string().min(2).max(120),
  email: z.string().email().max(255),
  password: z.string().min(8).max(72),
  phone: z.string().min(5).max(30),
  country: z.string().min(2).max(40),
});

const DRAFT_KEY = "lb_dossier_draft_v1";

function StartPage() {
  const search = useSearch({ from: "/start" });
  const navigate = useNavigate();
  const { isAuthenticated, user, profile, loading } = useAuth();
  const { lang } = useLang();

  const [plan, setPlan] = useState<string>(search.plan ?? "");
  const [form, setForm] = useState({
    full_name: "", email: "", password: "", phone: "", country: "ma",
    business_name: "", industry: "", industry_other: "", us_state: "Wyoming", business_desc: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Hydrate from sessionStorage on mount (resume-after-login)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.plan) setPlan(d.plan);
        if (d.form) setForm((f) => ({ ...f, ...d.form }));
      }
    } catch {}
  }, []);

  // Prefill name/email from profile once known
  useEffect(() => {
    if (profile && !form.full_name) {
      setForm((f) => ({
        ...f,
        full_name: profile.full_name ?? f.full_name,
        email: profile.email ?? f.email,
        phone: profile.phone ?? f.phone,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  useEffect(() => { if (search.plan) setPlan(search.plan); }, [search.plan]);

  const { data: services } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data } = await supabase.from("services").select("*").eq("is_active", true).order("sort_order");
      return data ?? [];
    },
  });

  const selectedService = services?.find((s) => s.slug === plan);
  const total = Number(selectedService?.price_usd ?? 0) + Number(selectedService?.state_fee_usd ?? 0);

  const saveDraft = () => {
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ plan, form })); } catch {}
  };

  const goSignIn = () => {
    saveDraft();
    navigate({ to: "/login", search: { redirect: "/start" } });
  };

  const submit = async () => {
    if (!selectedService) { toast.error("Choose a plan first"); return; }
    const biz = BizSchema.safeParse(form);
    if (!biz.success) { toast.error(biz.error.issues[0]?.message ?? "Complete the business details"); return; }

    setSubmitting(true);
    let clientId = user?.id;

    // If logged out, sign up first
    if (!clientId) {
      const acct = AcctSchema.safeParse(form);
      if (!acct.success) { setSubmitting(false); toast.error(acct.error.issues[0]?.message ?? "Complete your account info"); return; }
      const country = COUNTRIES.find((c) => c.code === acct.data.country);
      const { data: signup, error: signErr } = await supabase.auth.signUp({
        email: acct.data.email,
        password: acct.data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: acct.data.full_name,
            phone: acct.data.phone,
            country: country?.name ?? acct.data.country,
          },
        },
      });
      if (signErr || !signup.user) { setSubmitting(false); toast.error(signErr?.message ?? "Sign up failed"); return; }
      if (!signup.session) {
        // Email confirmation still required — guide the user
        setSubmitting(false);
        saveDraft();
        toast.success("Check your inbox to confirm your email, then come back to finish.");
        return;
      }
      clientId = signup.user.id;
      await supabase.from("profiles").update({
        phone: acct.data.phone,
        country: country?.name ?? acct.data.country,
        flag_emoji: country?.flag ?? null,
        whatsapp: acct.data.phone,
      }).eq("id", clientId);
    }

    const { error: orderErr } = await supabase.from("orders").insert({
      client_id: clientId,
      service_id: selectedService.id,
      business_name: form.business_name,
      industry: form.industry === "Other" ? (form.industry_other || "Other") : form.industry,
      us_state: form.us_state,
      business_desc: form.business_desc || null,
      amount_usd: selectedService.price_usd,
      state_fee_usd: selectedService.state_fee_usd,
      total_usd: total,
    });
    setSubmitting(false);
    if (orderErr) { toast.error(orderErr.message); return; }

    try { sessionStorage.removeItem(DRAFT_KEY); } catch {}
    toast.success("Dossier started! Welcome aboard 🎉");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {!isAuthenticated && !loading && (
        <div className="border-b border-border bg-card/40">
          <div className="mx-auto flex max-w-6xl items-center justify-end px-6 py-2">
            <button onClick={goSignIn} className="text-xs text-text-2 hover:text-primary">
              Already have an account? <span className="font-semibold text-primary">Sign in</span>
            </button>
          </div>
        </div>
      )}

      <main className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-10">
          {/* Plan */}
          <section>
            <div className="flex items-baseline justify-between">
              <h1 className="text-3xl font-extrabold">Start your LLC dossier</h1>
              <span className="text-xs font-bold uppercase tracking-wider text-text-3">Step 1 · Plan</span>
            </div>
            <p className="mt-1 text-text-2">Pick the plan that fits — upgrade anytime.</p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {services?.map((s) => {
                const active = plan === s.slug;
                const featuresMap = (s.features as Record<string, string[]> | null) ?? {};
                const features = featuresMap[lang] ?? featuresMap.en ?? [];
                const name = (s as Record<string, unknown>)[`name_${lang}`] as string | undefined ?? s.name_en;
                return (
                  <button key={s.id} onClick={() => setPlan(s.slug)} className={`rounded-2xl border p-5 text-left transition ${active ? "border-primary bg-primary/5 ring-2 ring-primary" : "border-border bg-card hover:border-primary/40"}`}>
                    <div className="flex items-center justify-between">
                      <div className="text-base font-bold">{name}</div>
                      {active && <Check className="h-5 w-5 text-primary" />}
                    </div>
                    <div className="mt-2 text-2xl font-extrabold text-primary">${s.price_usd}</div>
                    <ul className="mt-3 space-y-1 text-xs text-text-2">
                      {features.slice(0, 4).map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5"><Check className="mt-0.5 h-3.5 w-3.5 text-primary" /> {f}</li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Account (only when logged out) */}
          {!isAuthenticated && !loading && (
            <section>
              <div className="flex items-baseline justify-between">
                <h2 className="text-2xl font-extrabold">Create your account</h2>
                <span className="text-xs font-bold uppercase tracking-wider text-text-3">Step 2 · Account</span>
              </div>
              <p className="mt-1 text-text-2">Or <button onClick={goSignIn} className="font-semibold text-primary hover:underline">sign in</button> if you already have one — we'll keep your dossier safe.</p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Field label="Full name" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} />
                <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
                <Field label="Password (min 8 characters)" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} />
                <Field label="Phone / WhatsApp" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-text-2">Country</label>
                  <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="mt-1 h-11 w-full rounded-lg border border-border bg-card px-3 text-sm">
                    {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                  </select>
                </div>
              </div>
            </section>
          )}

          {/* Business */}
          <section>
            <div className="flex items-baseline justify-between">
              <h2 className="text-2xl font-extrabold">Your business</h2>
              <span className="text-xs font-bold uppercase tracking-wider text-text-3">{isAuthenticated ? "Step 2" : "Step 3"} · Details</span>
            </div>
            <p className="mt-1 text-text-2">We use this to file your LLC and set up your accounts.</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Desired company name" value={form.business_name} onChange={(v) => setForm({ ...form, business_name: v })} />
              <div>
                <label className="text-xs font-medium text-text-2">Industry / Business type</label>
                <select
                  value={form.industry}
                  onChange={(e) => setForm({ ...form, industry: e.target.value })}
                  className="mt-1 h-11 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary"
                >
                  <option value="">Select an industry…</option>
                  {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
                {form.industry === "Other" && (
                  <input
                    type="text"
                    value={form.industry_other}
                    onChange={(e) => setForm({ ...form, industry_other: e.target.value })}
                    placeholder="Tell us about your industry"
                    maxLength={120}
                    className="mt-2 h-11 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary"
                  />
                )}
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-text-2">Preferred US state</label>
                <select value={form.us_state} onChange={(e) => setForm({ ...form, us_state: e.target.value })} className="mt-1 h-11 w-full rounded-lg border border-border bg-card px-3 text-sm">
                  {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-text-2">Brief description (optional)</label>
                <textarea rows={3} value={form.business_desc} onChange={(e) => setForm({ ...form, business_desc: e.target.value })} maxLength={1000} className="mt-1 w-full rounded-lg border border-border bg-card p-3 text-sm" />
              </div>
            </div>
          </section>

          <button
            disabled={submitting || !plan}
            onClick={submit}
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-soft transition hover:-translate-y-0.5 hover:shadow-elegant disabled:opacity-50 disabled:hover:translate-y-0 md:hidden"
          >
            {submitting ? "Submitting…" : isAuthenticated ? "Start my dossier" : "Create account & start dossier"}
          </button>
        </div>

        {/* Sticky summary */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="text-xs font-bold uppercase tracking-wider text-text-3">Order summary</div>
            <div className="mt-3 text-sm">
              <Row k="Plan" v={(selectedService as Record<string, unknown> | undefined)?.[`name_${lang}`] as string ?? selectedService?.name_en ?? "— pick a plan"} />
              <Row k="Service" v={`$${selectedService?.price_usd ?? 0}`} />
              <Row k="State fee" v={`$${selectedService?.state_fee_usd ?? 0}`} />
              <div className="my-3 border-t border-border" />
              <Row k="Total" v={`$${total}`} bold />
            </div>
            <button
              disabled={submitting || !plan}
              onClick={submit}
              className="mt-5 hidden h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-soft transition hover:-translate-y-0.5 hover:shadow-elegant disabled:opacity-50 disabled:hover:translate-y-0 md:inline-flex"
            >
              {submitting ? "Submitting…" : isAuthenticated ? "Start my dossier" : "Create account & start"}
            </button>
            <p className="mt-3 text-center text-[11px] text-text-3">No payment today — pay when your dossier is ready to file.</p>
          </div>
        </aside>
      </main>
      <Footer />
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-text-2">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} maxLength={255} className="mt-1 h-11 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary" />
    </div>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between py-1 ${bold ? "text-base font-bold text-foreground" : "text-text-2"}`}>
      <span>{k}</span><span>{v}</span>
    </div>
  );
}
