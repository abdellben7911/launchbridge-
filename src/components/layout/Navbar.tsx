import { useEffect, useRef, useState } from "react";
import { Moon, Sun, Menu, X, LogOut, LayoutDashboard, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/ui/Logo";
import { useTheme } from "@/theme/ThemeProvider";
import { useLang } from "@/i18n/LanguageProvider";
import { LANGS, type Lang } from "@/i18n/translations";
import { useAuth } from "@/hooks/useAuth";


const navItems = [
  { to: "/services", key: "nav.services" },
  { to: "/academy", key: "nav.academy" },
  { to: "/method", key: "nav.method" },
  { to: "/countries", key: "nav.countries" },
  { to: "/pricing", key: "nav.pricing" },
  { to: "/blog", key: "nav.blog" },
  { to: "/about", key: "nav.why" },
] as const;

export function Navbar() {
  const { theme, toggle } = useTheme();
  const { lang, setLang, t } = useLang();
  const { isAuthenticated, isStaff, profile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);
  const acctRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (acctRef.current && !acctRef.current.contains(e.target as Node)) setAcctOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const initial = (profile?.full_name || user?.email || "?").trim().charAt(0).toUpperCase();

  const handleSignOut = async () => {
    setAcctOpen(false);
    setOpen(false);
    await signOut();
    navigate({ to: "/" });
  };



  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all ${scrolled ? "shadow-soft" : ""}`}
      style={{
        backgroundColor: "color-mix(in oklab, var(--background) 85%, transparent)",
        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.key}
              to={item.to}
              className="text-sm font-medium text-text-2 transition-colors hover:text-primary"
              activeProps={{ className: "text-primary font-semibold" }}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setLangOpen((o) => !o)}
              className="flex h-9 items-center gap-1 rounded-full border border-border bg-surface px-2 py-1 transition-all hover:border-primary/50 hover:shadow-soft"
              aria-label={`Change language — current: ${LANGS.find(l => l.code === lang)?.name}`}
              title={LANGS.find(l => l.code === lang)?.name}
            >
              <img
                src={`https://flagcdn.com/w40/${LANGS.find(l => l.code === lang)?.flagCode}.png`}
                srcSet={`https://flagcdn.com/w40/${LANGS.find(l => l.code === lang)?.flagCode}.png 1x, https://flagcdn.com/w80/${LANGS.find(l => l.code === lang)?.flagCode}.png 2x`}
                alt=""
                className="h-5 w-7 rounded-[3px] object-cover shadow-sm ring-1 ring-black/10"
              />
            </button>
            {langOpen && (
              <div className="absolute end-0 mt-2 w-40 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-elegant">
                {LANGS.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code as Lang); setLangOpen(false); }}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-accent ${l.code === lang ? "bg-accent/50 text-primary font-semibold" : ""}`}
                  >
                    <img
                      src={`https://flagcdn.com/w40/${l.flagCode}.png`}
                      alt=""
                      className="h-5 w-7 rounded-[3px] object-cover shadow-sm ring-1 ring-black/10"
                    />
                    <span>{l.name}</span>
                    {l.code === lang && <span className="ms-auto text-xs">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={toggle} className="rounded-full border border-border bg-surface p-2 hover:border-primary/40" aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {!isAuthenticated ? (
            <>
              <Link to="/login" className="hidden text-sm font-medium text-text-2 hover:text-primary md:inline-flex">
                {t("nav.signin")}
              </Link>
              <Link to="/signup" className="hidden rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elegant md:inline-flex">
                {t("nav.getStarted")} →
              </Link>
            </>
          ) : (
            <div ref={acctRef} className="relative hidden md:block">
              <button
                onClick={() => setAcctOpen((o) => !o)}
                className="flex h-9 items-center gap-2 rounded-full border border-border bg-surface ps-1 pe-3 hover:border-primary/40"
                aria-label="Account"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {initial}
                </span>
                <span className="text-xs font-semibold">{isStaff ? t("nav.staff") : t("nav.account")}</span>
              </button>
              {acctOpen && (
                <div className="absolute end-0 mt-2 w-52 overflow-hidden rounded-xl border border-border bg-popover shadow-elegant">
                  <div className="border-b border-border px-3 py-2">
                    <div className="truncate text-xs font-semibold">{profile?.full_name ?? user?.email}</div>
                    <div className="truncate text-[11px] text-text-3">{user?.email}</div>
                  </div>
                  <Link to="/dashboard" onClick={() => setAcctOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent">
                    <LayoutDashboard className="h-4 w-4" /> {t("nav.dashboard")}
                  </Link>
                  {isStaff && (
                    <Link to="/admin" onClick={() => setAcctOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent">
                      <ShieldCheck className="h-4 w-4 text-primary" /> {t("nav.admin")}
                    </Link>
                  )}
                  <button onClick={handleSignOut} className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-sm text-text-2 hover:bg-accent">
                    <LogOut className="h-4 w-4" /> {t("nav.signout")}
                  </button>
                </div>
              )}
            </div>
          )}

          <button className="lg:hidden rounded-full border border-border bg-surface p-2" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>


      {open && (
        <div className="lg:hidden border-t border-border bg-background/95 px-6 py-4 backdrop-blur">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <Link key={item.key} to={item.to} onClick={() => setOpen(false)} className="text-sm font-medium text-text-2 hover:text-primary">
                {t(item.key)}
              </Link>
            ))}
            <div className="mt-3 border-t border-border pt-3">
              {!isAuthenticated ? (
                <div className="flex flex-col gap-2">
                  <Link to="/login" onClick={() => setOpen(false)} className="inline-flex justify-center rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold">
                    {t("nav.signin")}
                  </Link>
                  <Link to="/signup" onClick={() => setOpen(false)} className="inline-flex justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                    {t("nav.getStarted")} →
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent">
                    <LayoutDashboard className="h-4 w-4" /> {t("nav.dashboard")}
                  </Link>
                  {isStaff && (
                    <Link to="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-primary hover:bg-accent">
                      <ShieldCheck className="h-4 w-4" /> {t("nav.admin")}
                    </Link>
                  )}
                  <button onClick={handleSignOut} className="flex items-center gap-2 rounded-lg px-3 py-2 text-start text-sm text-text-2 hover:bg-accent">
                    <LogOut className="h-4 w-4" /> {t("nav.signout")}
                  </button>
                </div>
              )}
            </div>
            <Link to="/contact" onClick={() => setOpen(false)} className="mt-3 inline-flex justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              {t("nav.cta")} →
            </Link>

          </div>
        </div>
      )}
    </header>
  );
}
