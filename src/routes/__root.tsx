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
  let tr = (k: string) => k;
  try { tr = useLang().t; } catch { /* before provider */ }
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">{tr("err.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{tr("err.body")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">{tr("err.try_again")}</button>
          <a href="/" className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent">{tr("err.go_home")}</a>
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
              "@id": "https://launchbridgepro.lovable.app/#organization",
              name: "LaunchBridge",
              url: "https://launchbridgepro.lovable.app",
              description: "360° Agency & Academy for MEA founders — US LLC formation, conversion web, paid acquisition, and operator academy.",
            },
            {
              "@type": "WebSite",
              "@id": "https://launchbridgepro.lovable.app/#website",
              url: "https://launchbridgepro.lovable.app",
              name: "LaunchBridge",
              publisher: { "@id": "https://launchbridgepro.lovable.app/#organization" },
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
