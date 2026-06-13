import { createFileRoute, Link, Outlet, useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/i18n/LanguageProvider";
import { useTheme } from "@/theme/ThemeProvider";
import { AlertTriangle, RefreshCw } from "lucide-react";
import {
  LayoutGrid, FileText, Phone, Globe, CreditCard, Headphones,
  LogOut, Shield, Sun, Moon, ChevronDown, Banknote, BarChart3,
  CalendarCheck2, Store, GraduationCap, Bell, Settings, Menu, X,
} from "lucide-react";
import { useState } from "react";
import { DashboardDataProvider, useDashboardDataCtx } from "@/hooks/DashboardDataContext";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { WorkspaceSwitcher } from "@/components/dashboard/WorkspaceSwitcher";

function DashboardErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  let t: (k: string) => string = (k) => k;
  try { t = useLang().t; } catch { /* fallback */ }
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h2 className="mt-5 text-xl font-bold text-foreground">Something went wrong</h2>
      <p className="mt-2 max-w-sm text-sm text-text-2">
        {error?.message || "An unexpected error occurred loading this page."}
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
        <a href="/dashboard" className="inline-flex items-center rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-text-2 hover:bg-accent">
          Back to dashboard
        </a>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardLayout,
  errorComponent: DashboardErrorComponent,
});

type NavItem = { to: string; labelKey: string; icon: typeof LayoutGrid; badge?: number };
type NavGroup = { labelKey: string; items: NavItem[] };

function DashboardLayout() {
  return (
    <DashboardDataProvider>
      <DashboardLayoutInner />
    </DashboardDataProvider>
  );
}

function DashboardLayoutInner() {
  const { profile, signOut, isStaff, user } = useAuth();
  const navigate = useNavigate();
  const { lang, setLang, t } = useLang();
  const { theme, toggle } = useTheme();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const fullName = profile?.full_name ?? "Michael Carter";
  const initials = fullName.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  const data = useDashboardDataCtx();
  const companyName = data.hasOrder ? data.company.legalEntity : t("sidebar.no_company");
  const actionRequiredCount = data.actionRequiredCount;
  const [mobileOpen, setMobileOpen] = useState(false);

  const groups: NavGroup[] = [
    {
      labelKey: "sidebar.overview",
      items: [
        { to: "/dashboard", labelKey: "sidebar.dashboard", icon: LayoutGrid },
        { to: "/dashboard/gateways", labelKey: "sidebar.gateway_workflow", icon: CreditCard, badge: actionRequiredCount },
      ],
    },
    {
      labelKey: "sidebar.operations",
      items: [
        { to: "/dashboard/ein", labelKey: "sidebar.ein", icon: FileText },
        { to: "/dashboard/documents", labelKey: "sidebar.documents", icon: FileText },
        { to: "/dashboard/banking", labelKey: "sidebar.banking", icon: Banknote },
        { to: "/dashboard/compliance", labelKey: "sidebar.compliance", icon: CalendarCheck2 },
        { to: "/dashboard/phone", labelKey: "sidebar.phone", icon: Phone },
        { to: "/dashboard/website", labelKey: "sidebar.website", icon: Globe },
      ],
    },
    {
      labelKey: "sidebar.growth",
      items: [
        { to: "/dashboard/store", labelKey: "sidebar.store", icon: Store },
        { to: "/dashboard/academy", labelKey: "sidebar.academy", icon: GraduationCap },
        { to: "/dashboard/analytics", labelKey: "sidebar.analytics", icon: BarChart3 },
      ],
    },
    {
      labelKey: "sidebar.account",
      items: [
        { to: "/dashboard/notifications", labelKey: "sidebar.notifications", icon: Bell },
        { to: "/dashboard/support", labelKey: "sidebar.support", icon: Headphones },
        { to: "/dashboard/settings", labelKey: "sidebar.settings", icon: Settings },
      ],
    },
  ];

  const allItems = groups.flatMap((g) => g.items);
  const pageTitle = t(allItems.find((n) => n.to === pathname)?.labelKey ?? "sidebar.dashboard");

  return (
    <div className="grid min-h-screen bg-bg-2 md:grid-cols-[280px_1fr]">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 start-0 z-40 flex w-72 flex-col border-e border-border bg-card transition-transform md:static md:w-auto md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Workspace switcher */}
        <div className="border-b border-border p-3">
          <WorkspaceSwitcher />
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3">
          {groups.map((group) => (
            <div key={group.labelKey} className="mb-4">
              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-text-3">
                {t(group.labelKey)}
              </div>
              <div className="space-y-0.5">
                {group.items.map((n) => {
                  const Icon = n.icon;
                  const active = pathname === n.to;
                  return (
                    <Link
                      key={n.to}
                      to={n.to}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all hover:-translate-y-px ${
                        active
                          ? "bg-primary/10 font-semibold text-primary"
                          : "text-text-2 hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 truncate">{t(n.labelKey)}</span>
                      {n.badge != null && n.badge > 0 && (
                        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                          {n.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {isStaff && (
            <Link
              to="/admin"
              className="mt-2 flex items-center gap-3 rounded-lg border border-primary/30 px-3 py-2 text-sm text-primary hover:bg-primary/10"
            >
              <Shield className="h-4 w-4" /> {t("sidebar.admin")}
            </Link>
          )}
        </nav>

        {/* Lang switcher */}
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

      {/* Main column */}
      <div className="flex min-h-screen flex-col">
        {/* Top bar */}
        <header className="flex h-16 items-center gap-4 border-b border-border bg-card px-4 md:px-6">
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-full text-text-2 hover:bg-accent md:hidden"
            aria-label={t("sidebar.toggle_menu")}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
          <div className="text-sm font-semibold text-foreground">{pageTitle}</div>

          <div className="ms-auto flex items-center gap-2">
            <button
              onClick={toggle}
              className="grid h-9 w-9 place-items-center rounded-full text-text-2 hover:bg-accent"
              aria-label={t("sidebar.toggle_theme")}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <NotificationBell />

            <div className="ms-2 hidden items-center gap-3 rounded-full border border-border bg-bg-2 ps-1 pe-3 py-1 sm:flex">
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                {initials}
              </div>
              <div className="text-xs leading-tight">
                <div className="font-bold text-foreground">{fullName}</div>
                <div className="text-[10px] text-text-3">{companyName}</div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-text-3" />
            </div>

            <button
              onClick={async () => { await signOut(); navigate({ to: "/" }); }}
              className="ms-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-text-2 hover:bg-accent"
              aria-label={t("sidebar.sign_out")}
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 lg:p-10">
          <Outlet />
        </main>
      </div>

      <span className="hidden">{user?.id}</span>
    </div>
  );
}
