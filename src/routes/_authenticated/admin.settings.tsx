import { createFileRoute, Link } from "@tanstack/react-router";
import { CURRENCIES } from "@/i18n/CurrencyProvider";
import { ArrowLeft, Info, Sun, Moon } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { useTheme } from "@/theme/ThemeProvider";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const { t, lang, setLang } = useLang();
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <Link to="/admin" className="inline-flex items-center gap-1 text-xs font-semibold text-text-3 hover:text-primary">
        <ArrowLeft className="h-3 w-3" /> {t("common.back_to_dashboard")}
      </Link>

      <header>
        <h1 className="text-3xl font-extrabold">{t("admin.settings.title")}</h1>
        <p className="mt-1 text-sm text-text-2">{t("admin.settings.subtitle")}</p>
      </header>

      {/* Appearance + Language */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-3">{t("appearance.title")}</h2>
          <p className="mt-2 text-sm text-text-2">{t("appearance.desc")}</p>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setTheme("light")}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                theme === "light" ? "bg-primary text-primary-foreground" : "border border-border text-text-2 hover:bg-accent"
              }`}
            >
              <Sun className="h-4 w-4" /> {t("appearance.light")}
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                theme === "dark" ? "bg-primary text-primary-foreground" : "border border-border text-text-2 hover:bg-accent"
              }`}
            >
              <Moon className="h-4 w-4" /> {t("appearance.dark")}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-3">{t("language.title")}</h2>
          <p className="mt-2 text-sm text-text-2">{t("language.desc")}</p>
          <div className="mt-4 flex gap-2">
            {(["en", "fr", "ar"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  lang === l ? "bg-primary text-primary-foreground" : "border border-border text-text-2 hover:bg-accent"
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-3">{t("admin.settings.base_currency")}</h2>
          <div className="mt-3 text-3xl font-extrabold text-primary">USD</div>
          <p className="mt-2 text-sm text-text-2">{t("admin.settings.base_desc")}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-3">{t("admin.settings.active_presets")}</h2>
          <div className="mt-3 text-3xl font-extrabold text-primary">{CURRENCIES.length}</div>
          <p className="mt-2 text-sm text-text-2">{t("admin.settings.presets_desc")}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-text-2">{t("admin.settings.fx_warn")}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-bg-2 text-left text-[11px] uppercase tracking-wider text-text-3">
            <tr>
              <th className="px-4 py-3">{t("admin.settings.col.code")}</th>
              <th className="px-4 py-3">{t("admin.settings.col.name")}</th>
              <th className="px-4 py-3">{t("admin.settings.col.symbol")}</th>
              <th className="px-4 py-3 text-end">{t("admin.settings.col.rate")}</th>
            </tr>
          </thead>
          <tbody>
            {CURRENCIES.map((c) => (
              <tr key={c.code} className="border-t border-border">
                <td className="px-4 py-2.5 font-bold">{c.code}</td>
                <td className="px-4 py-2.5 text-text-2">{c.name}</td>
                <td className="px-4 py-2.5">{c.symbol}</td>
                <td className="px-4 py-2.5 text-end font-mono text-xs">{c.rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
