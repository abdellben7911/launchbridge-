import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/i18n/LanguageProvider";
import { toast } from "sonner";
import { MailCheck } from "lucide-react";

function normalizeWhatsAppNumber(raw: string | undefined): string | null {
  if (!raw) return null;
  // Strip everything except digits — removes +, spaces, dashes, parentheses, etc.
  const digits = raw.replace(/\D/g, "");
  // wa.me requires a full international number (no leading +, but country code required).
  // If the number looks local (no country code), you can prepend a default here.
  // For now we keep it flexible and just validate it has at least 7 digits.
  return digits.length >= 7 ? digits : null;
}

export const Route = createFileRoute("/verify-email")({
  validateSearch: (s) => ({ email: (s.email as string) || "" }),
  head: () => ({ meta: [{ title: "Verify your email — LaunchBridge" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { email: emailFromSearch } = Route.useSearch();
  const navigate = useNavigate();
  const { t } = useLang();
  const [email, setEmail] = useState(emailFromSearch);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [resendCount, setResendCount] = useState(0);

  // If user becomes confirmed (in another tab), forward to dashboard.
  useEffect(() => {
    let mounted = true;
    const check = async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      if (data.user?.email_confirmed_at) {
        navigate({ to: "/dashboard" });
      } else if (data.user?.email && !email) {
        setEmail(data.user.email);
      }
    };
    check();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user?.email_confirmed_at) navigate({ to: "/dashboard" });
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate, email]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const resend = async () => {
    if (!email) {
      toast.error("Enter your email first");
      return;
    }
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    setResending(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Verification email sent");
      setCooldown(45);
      setResendCount((c) => c + 1);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f0e0] p-6 selection:bg-[#c9a84c]/30 selection:text-[#064e3b]">
      <div className="w-full max-w-md">
        <Link to="/" className="font-serif-display mb-10 inline-block text-2xl font-bold text-[#064e3b]">
          LaunchBridge
        </Link>
        <div className="rounded-3xl border border-[#064e3b]/10 bg-white/70 p-8 shadow-xl shadow-[#064e3b]/5 backdrop-blur">
          <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-[#064e3b] text-[#c9a84c]">
            <MailCheck className="h-7 w-7" />
          </div>
          <h1 className="font-serif-display text-3xl text-[#064e3b]">
            {t("auth.verify.title") || "Confirm your email"}
          </h1>
          <p className="mt-3 font-light leading-relaxed text-[#064e3b]/70">
            {(t("auth.verify.body") || "We sent a verification link to") + " "}
            <span className="font-semibold text-[#064e3b]">{email || "your inbox"}</span>.
            {" "}
            {t("auth.verify.bodyTail") || "Click the link in that email to activate your account and access your dashboard."}
          </p>

          <div className="mt-6 space-y-2">
            <label className="ml-1 text-[10px] font-bold uppercase tracking-[0.25em] text-[#064e3b]/50">
              {t("auth.email")}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full rounded-xl border border-[#064e3b]/10 bg-white px-5 py-3 text-sm text-[#064e3b] outline-none focus:border-transparent focus:ring-2 focus:ring-[#c9a84c]"
            />
          </div>

          <button
            onClick={resend}
            disabled={resending || cooldown > 0}
            className="mt-4 w-full rounded-xl bg-[#064e3b] py-4 text-xs font-bold uppercase tracking-[0.25em] text-[#f5f0e0] shadow-lg shadow-[#064e3b]/20 transition-all hover:bg-[#0d7a5f] active:scale-[0.98] disabled:opacity-60"
          >
            {resending
              ? "Sending…"
              : cooldown > 0
                ? `Resend in ${cooldown}s`
                : t("auth.verify.resend") || "Resend verification email"}
          </button>

          <p className="mt-6 text-center text-xs text-[#064e3b]/60">
            {t("auth.verify.alreadyConfirmed") || "Already confirmed?"}{" "}
            <button
              onClick={() => navigate({ to: "/dashboard" })}
              className="font-semibold text-[#c9a84c] hover:underline"
            >
              {t("auth.verify.continue") || "Continue to dashboard"}
            </button>
          </p>
        </div>

        {/* Dynamic help section — escalates with resend attempts */}
        {(() => {
          const waNum = normalizeWhatsAppNumber(import.meta.env.VITE_WHATSAPP_SUPPORT_NUMBER);
          const stage = resendCount === 0 ? 0 : resendCount === 1 ? 1 : 2;

          const steps: { bold: string; body: string }[] =
            stage === 0
              ? [
                  {
                    bold: t("auth.verify.step0.1.title") || "Check your inbox and spam folder.",
                    body: t("auth.verify.step0.1.body") || "Delivery can take 1–3 minutes. Look in Promotions, Updates, and Junk too.",
                  },
                  {
                    bold: t("auth.verify.step0.2.title") || "Wrong email address?",
                    body: t("auth.verify.step0.2.body") || "Update the field above and tap Resend to send a new link.",
                  },
                ]
              : stage === 1
                ? [
                    {
                      bold: t("auth.verify.step1.1.title") || "Still nothing?",
                      body: t("auth.verify.step1.1.body") || "Search your mailbox for \"LaunchBridge\" and check Spam, Junk, and Promotions tabs carefully.",
                    },
                    {
                      bold: t("auth.verify.step1.2.title") || "Whitelist our sender.",
                      body: t("auth.verify.step1.2.body") || "Add noreply@launchbridgepro.lovable.app to your contacts, then resend once the cooldown ends.",
                    },
                    {
                      bold: t("auth.verify.step1.3.title") || "Used the wrong email?",
                      body: t("auth.verify.step1.3.body") || "Sign out and create a new account with the correct address.",
                    },
                  ]
                : [
                    {
                      bold: t("auth.verify.step2.1.title") || "Your provider may be blocking us.",
                      body: t("auth.verify.step2.1.body") || "We've sent the verification email several times. Corporate or strict spam filters can silently block it.",
                    },
                    {
                      bold: t("auth.verify.step2.2.title") || "Reach our team directly.",
                      body: t("auth.verify.step2.2.body") || "Contact support and we'll activate your account manually within a few hours.",
                    },
                  ];

          const stageBadge =
            stage === 0
              ? t("auth.verify.stage0") || "Getting started"
              : stage === 1
                ? t("auth.verify.stage1") || "Still waiting"
                : t("auth.verify.stage2") || "Need direct help";

          return (
            <div className="mt-5 rounded-2xl border border-[#064e3b]/10 bg-white/50 p-6 backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-serif-display text-lg text-[#064e3b]">
                  {t("auth.verify.helpTitle") || "Need help?"}
                </h2>
                <span className="rounded-full bg-[#064e3b]/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#064e3b]/70">
                  {stageBadge}
                </span>
              </div>

              <ol className="mt-4 space-y-3 text-sm text-[#064e3b]/75">
                {steps.map((s, i) => (
                  <li
                    key={i}
                    className={`flex gap-3 rounded-lg border-l-2 py-1 pl-3 ${
                      i === 0 ? "border-[#c9a84c] bg-[#c9a84c]/5" : "border-[#064e3b]/10"
                    }`}
                  >
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#c9a84c]/20 text-xs font-bold text-[#c9a84c]">
                      {i + 1}
                    </span>
                    <p>
                      <span className="font-semibold text-[#064e3b]">{s.bold}</span>{" "}
                      {s.body}
                    </p>
                  </li>
                ))}
              </ol>

              <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[#064e3b]/10 pt-4">
                <a
                  href="mailto:support@launchbridgepro.lovable.app"
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] transition-all ${
                    stage >= 1
                      ? "bg-[#064e3b] text-[#f5f0e0] hover:bg-[#0d7a5f]"
                      : "border border-[#064e3b]/20 text-[#064e3b] hover:border-[#064e3b] hover:bg-[#064e3b]/5"
                  }`}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                  {t("auth.verify.emailSupport") || "Email support"}
                </a>
                {waNum && (
                  <a
                    href={`https://wa.me/${waNum}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] transition-all ${
                      stage >= 2
                        ? "bg-[#25D366] text-white hover:bg-[#1ebe57]"
                        : "border border-[#064e3b]/20 text-[#064e3b] hover:border-[#064e3b] hover:bg-[#064e3b]/5"
                    }`}
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.154 8.556h-.003a9.644 9.644 0 01-4.972-1.383l-.356-.213-3.692.969.985-3.599-.233-.374A9.637 9.637 0 012.058 12.02 9.658 9.658 0 0111.675 2.4a9.637 9.637 0 019.641 9.62 9.647 9.647 0 01-9.398 9.918m7.202-14.339A11.657 11.657 0 0011.675 0C5.23 0 0 5.231 0 11.675c0 2.054.537 4.059 1.553 5.822l-1.64 6.006 6.135-1.61A11.63 11.63 0 0011.675 23.35c6.444 0 11.675-5.231 11.675-11.675 0-3.123-1.216-6.057-3.426-8.276"/></svg>
                    WhatsApp
                  </a>
                )}
                {stage === 0 && (
                  <span className="text-xs text-[#064e3b]/50">
                    {t("auth.verify.resendPrompt") || "Nothing yet? Use Resend above."}
                  </span>
                )}
              </div>
            </div>
          );
        })()}

        <div className="mt-6 flex items-center justify-between text-xs text-[#064e3b]/60">
          <Link to="/login" className="font-bold uppercase tracking-[0.25em] hover:text-[#c9a84c]">
            ← {t("auth.signin") || "Sign in"}
          </Link>
          <button onClick={signOut} className="font-bold uppercase tracking-[0.25em] hover:text-[#c9a84c]">
            {t("auth.signout") || "Sign out"}
          </button>
        </div>
      </div>
    </div>
  );
}
