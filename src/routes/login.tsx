import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/i18n/LanguageProvider";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  validateSearch: (s) => ({ redirect: (s.redirect as string) || "/dashboard" }),
  head: () => ({ meta: [{ title: "Sign in — LaunchBridge" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: LoginPage,
});

const Schema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(6).max(72),
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

function LoginPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { isAuthenticated, isStaff, loading } = useAuth();
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate({ to: isStaff ? "/admin" : "/dashboard" });
    }
  }, [loading, isAuthenticated, isStaff, navigate, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setSubmitting(false);
    if (error) toast.error(error.message);
    else toast.success(t("auth.welcomeBack"));
  };

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/dashboard",
      },
    });
    if (error) toast.error(t("auth.signinFailed"));
  };

  return (
    <div className="min-h-screen w-full bg-[#f5f0e0] selection:bg-[#c9a84c]/30 selection:text-[#064e3b]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col overflow-hidden lg:flex-row lg:rounded-none">
        {/* Form column */}
        <div className="relative flex w-full flex-col justify-center px-6 py-12 sm:px-12 md:px-16 lg:w-1/2 lg:px-20 xl:px-24">
          <div className="absolute inset-x-6 top-8 flex items-center justify-between sm:inset-x-12 lg:inset-x-20 xl:inset-x-24">
            <Link to="/" className="font-serif-display text-2xl font-bold tracking-tight text-[#064e3b]">
              LaunchBridge
            </Link>
            <LangSwitcher />
          </div>

          <div className="mx-auto w-full max-w-md">
            <header className="mb-10">
              <h1 className="font-serif-display mb-3 text-4xl text-[#064e3b] lg:text-5xl">
                {t("auth.login.title")}
              </h1>
              <p className="font-light text-[#064e3b]/70">{t("auth.login.subtitle")}</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-bold uppercase tracking-[0.25em] text-[#064e3b]/50">
                  {t("auth.email")}
                </label>
                <input
                  type="email"
                  required
                  maxLength={255}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-xl border border-[#064e3b]/10 bg-white/60 px-5 py-4 text-[#064e3b] outline-none transition-all placeholder:text-[#064e3b]/30 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#c9a84c]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="ml-1 text-[10px] font-bold uppercase tracking-[0.25em] text-[#064e3b]/50">
                    {t("auth.password")}
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#c9a84c] hover:underline"
                  >
                    {t("auth.forgot")}
                  </Link>
                </div>
                <input
                  type="password"
                  required
                  minLength={6}
                  maxLength={72}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[#064e3b]/10 bg-white/60 px-5 py-4 text-[#064e3b] outline-none transition-all placeholder:text-[#064e3b]/30 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#c9a84c]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-[#064e3b] py-5 text-xs font-bold uppercase tracking-[0.25em] text-[#f5f0e0] shadow-lg shadow-[#064e3b]/25 transition-all hover:bg-[#0d7a5f] active:scale-[0.98] disabled:opacity-60"
              >
                {submitting ? t("auth.signing") : t("auth.signin")}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[#064e3b]/40">
              <span className="h-px flex-1 bg-[#064e3b]/10" />
              {t("auth.or")}
              <span className="h-px flex-1 bg-[#064e3b]/10" />
            </div>

            <button
              onClick={handleGoogle}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#064e3b]/10 bg-white/60 text-sm font-semibold text-[#064e3b] transition-all hover:bg-white hover:ring-2 hover:ring-[#c9a84c]/40"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t("auth.login.google")}
            </button>

            <div className="mt-10 border-t border-[#064e3b]/10 pt-6 text-center text-sm text-[#064e3b]/60">
              {t("auth.createAccount")}{" "}
              <Link to="/signup" className="ml-1 font-semibold text-[#c9a84c] hover:underline">
                →
              </Link>
            </div>
          </div>
        </div>

        <CinematicHero />
      </div>
    </div>
  );
}
