import { createFileRoute, Link, Outlet, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/i18n/LanguageProvider";
import { useTheme } from "@/theme/ThemeProvider";
import {
  LayoutDashboard, Users, ClipboardList, FileCheck, MessageSquare,
  Newspaper, LogOut, Package, Settings as SettingsIcon, Sun, Moon, Menu, X,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const { data: s } = await supabase.auth.getSession();
    if (!s.session) throw redirect({ to: "/login" });
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", s.session.user.id);
    const isStaff = (roles ?? []).some((r: { role: string }) => r.role === "admin" || r.role === "support");
    if (!isStaff) throw redirect({ to: "/dashboard" });
  },
  component: AdminLayout,
});

function AdminLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { lang, setLang, t } = useLang();
  const { theme, toggle } = useTheme();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = [
    { to: "/admin", labelKey: "admin.nav.dashboard", icon: LayoutDashboard, exact: true },
    { to: "/admin/clients", labelKey: "admin.nav.clients", icon: Users },
    { to: "/admin/orders", labelKey: "admin.nav.orders", icon: ClipboardList },
    { to: "/admin/documents", labelKey: "admin.nav.documents", icon: FileCheck },
    { to: "/admin/messages", labelKey: "admin.nav.messages", icon: MessageSquare },
    { to: "/admin/plans", labelKey: "admin.nav.plans", icon: Package },
    { to: "/admin/blog", labelKey: "admin.nav.blog", icon: Newspaper },
    { to: "/admin/settings", labelKey: "admin.nav.settings", icon: SettingsIcon },
  ];

  const active = nav.find((n) => (n.exact ? pathname === n.to : pathname.startsWith(n.to)));
  const pageTitle = t(active?.labelKey ?? "admin.title");
  const fullName = profile?.full_name ?? profile?.email ?? "Admin";
  const initials = fullName.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="grid min-h-screen bg-bg-2 md:grid-cols-[240px_1fr]">
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 start-0 z-40 flex w-64 flex-col border-e border-border bg-card transition-transform md:static md:w-auto md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-5">
          <Link to="/" className="font-serif-display text-xl text-primary">⚡ {t("admin.title")}</Link>
          <p className="mt-1 truncate text-xs text-text-3">{profile?.email}</p>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.exact }}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-2 hover:bg-accent [&.active]:bg-primary/10 [&.active]:text-primary [&.active]:font-semibold"
            >
              <n.icon className="h-4 w-4" /> {t(n.labelKey)}
            </Link>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <div className="flex gap-1">
            {(["en", "fr", "ar"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`flex-1 rounded px-2 py-1.5 text-xs font-semibold transition-colors ${
                  lang === l ? "bg-primary text-primary-foreground" : "text-text-2 hover:bg-accent"
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="flex h-16 items-center gap-4 border-b border-border bg-card px-4 md:px-6">
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-full text-text-2 hover:bg-accent md:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
          <div className="text-sm font-semibold text-foreground">{pageTitle}</div>

          <div className="ms-auto flex items-center gap-2">
            <button
              onClick={toggle}
              className="grid h-9 w-9 place-items-center rounded-full text-text-2 hover:bg-accent"
              aria-label={t("appearance.title")}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <div className="ms-2 hidden items-center gap-3 rounded-full border border-border bg-bg-2 ps-1 pe-3 py-1 sm:flex">
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                {initials}
              </div>
              <div className="text-xs leading-tight">
                <div className="font-bold text-foreground">{fullName}</div>
                <div className="text-[10px] text-text-3">{t("admin.title")}</div>
              </div>
            </div>

            <button
              onClick={async () => { await signOut(); navigate({ to: "/" }); }}
              className="ms-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-text-2 hover:bg-accent"
              aria-label={t("admin.sign_out")}
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t("admin.sign_out")}</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-10"><Outlet /></main>
      </div>
    </div>
  );
}
