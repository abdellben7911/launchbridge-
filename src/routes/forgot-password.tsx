import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/i18n/LanguageProvider";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — LaunchBridge" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: ForgotPage,
});

function ForgotPage() {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else setSent(true);
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f0e0] p-6">
      <div className="w-full max-w-sm">
        <Link to="/" className="font-serif-display mb-8 inline-block text-2xl font-bold text-[#064e3b]">LaunchBridge</Link>
        <h1 className="font-serif-display text-3xl text-[#064e3b]">{t("auth.forgot.title")}</h1>
        <p className="mt-2 text-sm font-light text-[#064e3b]/70">{t("auth.forgot.subtitle")}</p>
        {sent ? (
          <p className="mt-8 rounded-xl border border-[#064e3b]/10 bg-white/60 p-5 text-sm text-[#064e3b]">{t("auth.forgot.sent")}</p>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-[#064e3b]/10 bg-white/60 px-5 py-4 text-sm text-[#064e3b] outline-none focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#c9a84c]"
            />
            <button className="w-full rounded-xl bg-[#064e3b] py-4 text-xs font-bold uppercase tracking-[0.25em] text-[#f5f0e0] shadow-lg shadow-[#064e3b]/25 hover:bg-[#0d7a5f]">
              {t("auth.forgot.send")}
            </button>
          </form>
        )}
        <Link to="/login" className="mt-6 inline-block text-xs font-bold uppercase tracking-[0.25em] text-[#c9a84c] hover:underline">
          ← {t("auth.forgot.back")}
        </Link>
      </div>
    </div>
  );
}
