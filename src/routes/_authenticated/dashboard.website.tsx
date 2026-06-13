import { createFileRoute } from "@tanstack/react-router";
import { Globe, ExternalLink } from "lucide-react";
import { StatusPill, ProgressBar, Card } from "@/components/dashboard/shared";
import { useDashboardDataCtx } from "@/hooks/DashboardDataContext";

export const Route = createFileRoute("/_authenticated/dashboard/website")({
  component: WebsitePage,
});

function WebsitePage() {
  const data = useDashboardDataCtx();
  return (
    <div className="mx-auto max-w-4xl">
      <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-text-3">
        <Globe className="h-3.5 w-3.5" /> Web Presence
      </div>
      <div className="mt-2 flex items-center gap-3">
        <h1 className="text-3xl font-black tracking-tight text-foreground">Website & Domain</h1>
        <StatusPill status="active" />
      </div>
      <p className="mt-2 max-w-2xl text-sm text-text-2">
        Your domain, professional email, and conversion-grade website build — all in one place.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <Card>
          <div className="text-sm font-bold text-foreground">Domain</div>
          <div className="mt-3 flex items-center justify-between rounded-xl bg-bg-2 p-3">
            <span className="font-mono text-sm font-bold text-foreground">
              {data.services.domain}
            </span>
            <a
              href={`https://${data.services.domain}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              Visit <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="mt-3 text-xs text-text-3">
            SSL active · Auto-renewal enabled.
          </div>
        </Card>

        <Card>
          <div className="text-sm font-bold text-foreground">Build progress</div>
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-text-2">Website build</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {data.services.websiteProgress}%
              </span>
            </div>
            <ProgressBar value={data.services.websiteProgress} tone="primary" />
          </div>
          <div className="mt-4 text-xs text-text-3">
            Currently in copy & visual review with your specialist.
          </div>
        </Card>
      </div>
    </div>
  );
}
