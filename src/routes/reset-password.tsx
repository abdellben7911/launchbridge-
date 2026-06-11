import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/i18n/LanguageProvider";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Set new password — LaunchBridge" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [pw, setPw] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) toast.error(error.message);
    else {
      toast.success(t("auth.reset.success"));
      navigate({ to: "/dashboard" });
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f0e0] p-6">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4">
        <Link to="/" className="font-serif-display mb-4 inline-block text-2xl font-bold text-[#064e3b]">LaunchBridge</Link>
        <h1 className="font-serif-display text-3xl text-[#064e3b]">{t("auth.reset.title")}</h1>
        <input
          type="password"
          required
          minLength={6}
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder={t("auth.reset.new")}
          className="w-full rounded-xl border border-[#064e3b]/10 bg-white/60 px-5 py-4 text-sm text-[#064e3b] outline-none focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#c9a84c]"
        />
        <button className="w-full rounded-xl bg-[#064e3b] py-4 text-xs font-bold uppercase tracking-[0.25em] text-[#f5f0e0] shadow-lg shadow-[#064e3b]/25 hover:bg-[#0d7a5f]">
          {t("auth.reset.update")}
        </button>
      </form>
    </div>
  );
}
