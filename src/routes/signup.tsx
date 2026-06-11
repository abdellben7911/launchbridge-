import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { COUNTRIES } from "@/lib/saas-constants";
import { useLang } from "@/i18n/LanguageProvider";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create your account — LaunchBridge" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: SignupPage,
});

const PHONE_RE = /^\+[1-9]\d{6,14}$/;

const Schema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(120),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
  phone: z.string().regex(PHONE_RE, "Enter a valid phone number with country code"),
  country: z.string().min(2, "Pick your country").max(40),
});

function LangSwitcher() {
  const { lang, setLang } = useLang();
  const Item = ({ code, label }: { code: "en" | "fr" | "ar"; label: string }) => (
    <button
      onClick={() => setLang(code)}
      className={`uppercase tracking-[0.2em] text-[11px] font-semibold transition-colors ${
        lang === code ? "text-[#6fcf97]" : "text-[#064e3b]/50 hover:text-[#0d7a5f]"
      }`}
    >
      {label}
    </button>
  );
  return (
    <div className="flex items-center gap-3">
      <Item code="en" label="EN" />
      <span className="text-[#064e3b]/20">|</span>
      <Item code="fr" label="FR" />
      <span className="text-[#064e3b]/20">|</span>
      <Item code="ar" label="عربي" />
    </div>
  );
}

function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <g transform="rotate(45 20 20)">
        <rect x="4" y="4" width="14" height="14" fill="#6fcf97" rx="1.5" />
        <rect x="22" y="4" width="14" height="14" fill="#1f6f5f" rx="1.5" />
        <rect x="4" y="22" width="14" height="14" fill="#1f6f5f" rx="1.5" />
        <rect x="22" y="22" width="14" height="14" fill="#6fcf97" rx="1.5" />
      </g>
    </svg>
  );
}

function CinematicHero() {
  const { t } = useLang();
  return (
    <div className="relative hidden overflow-hidden lg:flex lg:w-1/2">
      <div className="absolute inset-0 bg-[#064e3b]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0d7a5f]/40" />

      <div className="pointer-events-none absolute -bottom-24 -end-24 opacity-[0.08]">
        <BrandMark className="h-[34rem] w-[34rem]" />
      </div>

      <div className="relative z-10 flex h-full w-full flex-col justify-end p-12 xl:p-20">
        <div className="max-w-xl animate-fade-in">
          <span className="mb-8 inline-block rounded-full border border-[#f5f0e0]/30 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-[#f5f0e0]/80">
            {t("auth.heroPill") || "Private Beta"}
          </span>
          <h2 className="font-serif-display mb-6 text-4xl leading-tight text-[#f5f0e0] xl:text-5xl">
            {t("auth.heroTitle") || "Bridging Casablanca to New York."}
          </h2>
          <p className="text-lg font-light leading-relaxed text-[#f5f0e0]/65">
            {t("auth.heroBody") ||
              "Join the founders scaling their ventures with tax-efficient US structures. Considered service, automated precision."}
          </p>
          <div className="my-8 h-px w-16 bg-[#f5f0e0]/30" />
          <div className="flex items-center gap-5">
            <div className="flex -space-x-3">
              <div className="h-10 w-10 rounded-full border-2 border-[#064e3b] bg-[#0d7a5f]" />
              <div className="h-10 w-10 rounded-full border-2 border-[#064e3b] bg-[#6fcf97]" />
              <div className="h-10 w-10 rounded-full border-2 border-[#064e3b] bg-[#f5f0e0]" />
            </div>
            <span className="text-xs font-medium uppercase tracking-[0.25em] text-[#f5f0e0]/55">
              {t("auth.heroTrust") || "Trusted by 500+ founders"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const fieldCls =
  "w-full rounded-xl border border-[#064e3b]/10 bg-white/60 px-5 py-4 text-[#064e3b] outline-none transition-all placeholder:text-[#064e3b]/30 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#c9a84c]";
const labelCls =
  "ml-1 text-[10px] font-bold uppercase tracking-[0.25em] text-[#064e3b]/50";

function SignupPage() {
  const navigate = useNavigate();
  const { t } = useLang();
  const { isAuthenticated, loading } = useAuth();
  const [full_name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dial, setDial] = useState("+212");
  const [phoneLocal, setPhoneLocal] = useState("");
  const [countryCode, setCountryCode] = useState("ma");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) navigate({ to: "/dashboard" });
    // _authenticated guard will bounce to /verify-email if the email isn't confirmed.
  }, [loading, isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phone = (dial + phoneLocal).replace(/[\s-]/g, "");
    const country = COUNTRIES.find((c) => c.code === countryCode);
    const parsed = Schema.safeParse({
      full_name,
      email,
      password,
      phone,
      country: country?.name ?? countryCode,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          full_name: parsed.data.full_name,
          phone: parsed.data.phone,
          country: parsed.data.country,
        },
      },
    });
    const { data: signUpData } = error ? { data: null } : await supabase.auth.getSession();
    if (!error && signUpData?.session?.user) {
      // Session exists only when email confirmation is disabled — best-effort profile patch.
      const uid = signUpData.session.user.id;
      await supabase
        .from("profiles")
        .update({ flag_emoji: country?.flag ?? null, whatsapp: parsed.data.phone })
        .eq("id", uid);
    }
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t("auth.signup.checkEmail") || "Check your email to confirm your account");
    navigate({ to: "/verify-email", search: { email: parsed.data.email } });
  };

  const handleGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/dashboard",
    });
    if (result.error) toast.error(t("auth.signinFailed"));
  };

  const onCountryChange = (code: string) => {
    setCountryCode(code);
    const c = COUNTRIES.find((x) => x.code === code);
    if (c && c.dial !== "+") setDial(c.dial);
  };

  return (
    <div className="min-h-screen w-full bg-[#f5f0e0] selection:bg-[#c9a84c]/30 selection:text-[#064e3b]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col overflow-hidden lg:flex-row">
        <div className="relative flex w-full flex-col justify-center px-6 py-12 sm:px-12 md:px-16 lg:w-1/2 lg:px-20 xl:px-24">
          <div className="absolute inset-x-6 top-8 flex items-center justify-between sm:inset-x-12 lg:inset-x-20 xl:inset-x-24">
            <Link to="/" className="font-serif-display text-2xl font-bold tracking-tight text-[#064e3b]">
              LaunchBridge
            </Link>
            <LangSwitcher />
          </div>

          <div className="mx-auto w-full max-w-md py-16">
            <header className="mb-8">
              <h1 className="font-serif-display mb-3 text-4xl text-[#064e3b] lg:text-5xl">
                {t("auth.signup.title")}
              </h1>
              <p className="font-light text-[#064e3b]/70">{t("auth.signup.subtitle")}</p>
            </header>

            <button
              onClick={handleGoogle}
              className="mb-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#064e3b]/10 bg-white/60 text-sm font-semibold text-[#064e3b] transition-all hover:bg-white hover:ring-2 hover:ring-[#c9a84c]/40"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t("auth.signup.google")}
            </button>

            <div className="mb-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[#064e3b]/40">
              <span className="h-px flex-1 bg-[#064e3b]/10" />
              {t("auth.or")}
              <span className="h-px flex-1 bg-[#064e3b]/10" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className={labelCls}>{t("auth.signup.fullName")}</label>
                <input value={full_name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={120} className={fieldCls} />
              </div>
              <div className="space-y-2">
                <label className={labelCls}>{t("auth.email")}</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} placeholder="name@company.com" className={fieldCls} />
              </div>
              <div className="space-y-2">
                <label className={labelCls}>{t("auth.signup.country")}</label>
                <select value={countryCode} onChange={(e) => onCountryChange(e.target.value)} className={fieldCls}>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className={labelCls}>{t("auth.signup.phone")}</label>
                <div className="flex gap-2">
                  <select value={dial} onChange={(e) => setDial(e.target.value)} className={`${fieldCls} w-32`}>
                    {COUNTRIES.filter((c) => c.dial !== "+").map((c) => (
                      <option key={c.code + c.dial} value={c.dial}>{c.flag} {c.dial}</option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={phoneLocal}
                    onChange={(e) => setPhoneLocal(e.target.value.replace(/[^\d]/g, ""))}
                    required
                    maxLength={15}
                    placeholder="612345678"
                    className={`${fieldCls} flex-1`}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className={labelCls}>{t("auth.password")}</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} maxLength={72} placeholder="••••••••" className={fieldCls} />
                <p className="ml-1 text-[11px] text-[#064e3b]/40">{t("auth.signup.passwordHint")}</p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-[#064e3b] py-5 text-xs font-bold uppercase tracking-[0.25em] text-[#f5f0e0] shadow-lg shadow-[#064e3b]/25 transition-all hover:bg-[#0d7a5f] active:scale-[0.98] disabled:opacity-60"
              >
                {submitting ? t("auth.signup.creating") : t("auth.signup.create")}
              </button>
            </form>

            <div className="mt-8 border-t border-[#064e3b]/10 pt-6 text-center text-sm text-[#064e3b]/60">
              {t("auth.signup.have")}{" "}
              <Link to="/login" className="ml-1 font-semibold text-[#c9a84c] hover:underline">
                {t("auth.signin")}
              </Link>
            </div>
          </div>
        </div>

        <CinematicHero />
      </div>
    </div>
  );
}
