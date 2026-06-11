import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/ui/Logo";
import { useLang } from "@/i18n/LanguageProvider";

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="border-t border-border bg-bg-2">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm text-text-2">{t("footer.tagline")}</p>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-text-3">{t("footer.product")}</div>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/services" className="text-text-2 hover:text-primary">{t("nav.services")}</Link></li>
              <li><Link to="/academy" className="text-text-2 hover:text-primary">{t("nav.academy")}</Link></li>
              <li><Link to="/method" className="text-text-2 hover:text-primary">{t("nav.method")}</Link></li>
              <li><Link to="/pricing" className="text-text-2 hover:text-primary">{t("nav.pricing")}</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-text-3">{t("footer.company")}</div>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/about" className="text-text-2 hover:text-primary">{t("nav.about")}</Link></li>
              <li><Link to="/countries" className="text-text-2 hover:text-primary">{t("nav.countries")}</Link></li>
              <li><Link to="/contact" className="text-text-2 hover:text-primary">{t("nav.contact")}</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-text-3">{t("footer.account")}</div>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/login" className="text-text-2 hover:text-primary">{t("footer.signin")}</Link></li>
              <li><Link to="/signup" className="text-text-2 hover:text-primary">{t("footer.create")}</Link></li>
              <li><Link to="/dashboard" className="text-text-2 hover:text-primary">{t("footer.dashboard")}</Link></li>
              <li><Link to="/forgot-password" className="text-text-2 hover:text-primary">{t("footer.forgot")}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 md:flex-row md:items-center">
          <span className="text-xs text-text-3">{t("footer.rights")}</span>
          <span className="text-xs text-text-3">{t("footer.made")}</span>
        </div>
      </div>
    </footer>
  );
}
