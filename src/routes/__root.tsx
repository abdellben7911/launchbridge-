import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { LanguageProvider, useLang } from "@/i18n/LanguageProvider";
import { CurrencyProvider } from "@/i18n/CurrencyProvider";
import { CurrencyChip } from "@/components/layout/CurrencyChip";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  let tr = (k: string) => k;
  try { tr = useLang().t; } catch { /* before provider — fallback to keys */ }
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif-display text-8xl text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">{tr("err.404")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{tr("err.404_body")}</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">{tr("err.back_home")}</Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  // This component renders OUTSIDE the provider tree (it replaces RootComponent),
  // so useLang() would throw. We use hardcoded English strings as the safe fallback.
  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }} className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-rose-100 text-rose-600">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <h1 className="text-xl font-semibold text-foreground">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">An unexpected error occurred. Please try again or return to the home page.</p>
        {error?.message && (
          <p className="mt-3 rounded-lg bg-rose-50 px-4 py-2 text-xs text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
            {error.message}
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Try again
          </button>
          <a href="/" className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "LaunchBridge — 360° Agency & Academy for MEA founders" },
      { name: "description", content: "Build your international business with LaunchBridge — US LLC formation, conversion-grade web infrastructure, paid acquisition, and an operator-grade academy." },
      { name: "author", content: "LaunchBridge" },
      { property: "og:site_name", content: "LaunchBridge" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://launchbridgepro.com/#organization",
              name: "LaunchBridge",
              url: "https://launchbridgepro.com",
              logo: {
                "@type": "ImageObject",
                url: "https://launchbridgepro.com/favicon.svg",
                width: 100,
                height: 100,
              },
              description: "LaunchBridge helps MEA founders form US LLCs, access Stripe and PayPal, and open US bank accounts — fully remote, in as little as 2 days.",
              areaServed: ["MA", "DZ", "TN", "EG", "SN", "CI", "SN"],
              knowsAbout: ["US LLC formation", "Stripe for non-residents", "PayPal Business", "Mercury Bank", "Wyoming LLC", "Montana LLC", "New Mexico LLC"],
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer support",
                availableLanguage: ["English", "French", "Arabic"],
              },
              sameAs: [
                "https://www.instagram.com/launchbridgepro",
              ],
            },
            {
              "@type": "WebSite",
              "@id": "https://launchbridgepro.com/#website",
              url: "https://launchbridgepro.com",
              name: "LaunchBridge",
              description: "US LLC formation and payment gateway access for MEA founders",
              publisher: { "@id": "https://launchbridgepro.com/#organization" },
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: "https://launchbridgepro.com/blog?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            },
            {
              "@type": "Service",
              "@id": "https://launchbridgepro.com/#llc-service",
              name: "US LLC Formation for Non-Residents",
              provider: { "@id": "https://launchbridgepro.com/#organization" },
              description: "Complete US LLC formation service for non-US residents including EIN, registered agent, US phone number, and payment gateway onboarding.",
              areaServed: "Worldwide",
              serviceType: "Business Formation",
              offers: {
                "@type": "AggregateOffer",
                priceCurrency: "MAD",
                lowPrice: "1299",
                highPrice: "2999",
                offerCount: "9",
              },
            },
          ],
        }),
      },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

const PREHYDRATE_LANG = `(function(){try{var l=localStorage.getItem('lb-lang');if(!l){var n=(navigator.language||'en').toLowerCase();l=n.indexOf('ar')===0?'ar':n.indexOf('fr')===0?'fr':'en';}var h=document.documentElement;h.lang=l;h.dir=l==='ar'?'rtl':'ltr';if(l==='ar')h.classList.add('lang-ar');}catch(e){}})();`;

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: PREHYDRATE_LANG }} />
      </head>
      <body suppressHydrationWarning>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isApp =
    path.startsWith("/dashboard") ||
    path.startsWith("/admin") ||
    path.startsWith("/start") ||
    path === "/login" ||
    path === "/signup" ||
    path === "/verify-email" ||
    path === "/forgot-password" ||
    path === "/reset-password";

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <CurrencyProvider>
            <AuthProvider>
              <div className="min-h-screen bg-background text-foreground">
                {!isApp && <Navbar />}
                <main className={isApp ? "" : "pt-16"}>
                  <Outlet />
                </main>
                {!isApp && <Footer />}
              </div>
              {!isApp && <CurrencyChip />}
              {!isApp && <WhatsAppFloat />}
              <Toaster />
            </AuthProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
