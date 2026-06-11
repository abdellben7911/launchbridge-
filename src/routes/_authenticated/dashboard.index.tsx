import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Lock, Phone, Globe, Headphones, FileText, ShieldCheck, ArrowRight, Building2, Sparkles } from "lucide-react";
import {
  StatusPill, ProgressBar, GatewayLogo, Card,
} from "@/components/dashboard/shared";
import { useDashboardData } from "@/hooks/useDashboardData";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: OverviewPage,
});

function OverviewPage() {
  const data = useDashboardData();
  if (!data.hasOrder) {
    return <EmptyState />;
  }
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* 4 status summary cards */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          to="/dashboard/ein"
          icon={FileText}
          title="EIN / Federal Number"
          status="pending"
        >
          <Row label="Federal EIN" value={data.company.federalEin} mono />
          <div className="mt-3">
            <div className="mb-1.5 flex items-center justify-between text-[11px] text-text-3">
              <span>IRS processing</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                {data.company.einProgress}%
              </span>
            </div>
            <ProgressBar value={data.company.einProgress} tone="amber" />
          </div>
          <Footer>Letter (CP-575) unlocks once issued</Footer>
        </SummaryCard>

        <SummaryCard
          to="/dashboard/phone"
          icon={Phone}
          title="U.S. Phone"
          status="active"
        >
          <Row label="Number" value={data.services.phoneNumber} mono />
          <Row label="Login email" value={data.services.loginEmail} />
          <Footer>Number, login & app access</Footer>
        </SummaryCard>

        <SummaryCard
          to="/dashboard/website"
          icon={Globe}
          title="Website & Domain"
          status="active"
        >
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-3">Domain</span>
            <span className="inline-flex items-center gap-1 font-semibold text-foreground">
              {data.services.domain}
              <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-emerald-500 text-[8px] text-white">✓</span>
            </span>
          </div>
          <div className="mt-3">
            <div className="mb-1.5 flex items-center justify-between text-[11px] text-text-3">
              <span>Website build</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {data.services.websiteProgress}%
              </span>
            </div>
            <ProgressBar value={data.services.websiteProgress} tone="primary" />
          </div>
          <Footer>Domain, email & build status</Footer>
        </SummaryCard>

        <SummaryCard
          to="/dashboard/support"
          icon={Headphones}
          title="Support"
          status="online"
        >
          <Row label="Specialist" value={data.specialist.name} />
          <Row label="Latest update" value={data.specialist.lastUpdate} />
          <Footer>Replies in under 2 hours</Footer>
        </SummaryCard>
      </div>

      {/* Payment Gateway Workflow */}
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Payment Gateway Workflow</h2>
            <p className="mt-1 text-sm text-text-2">
              Your primary payment flow, left to right. Tap any gateway for details.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Link
              to="/dashboard/gateways"
              className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
            >
              Open payment gateways <ArrowRight className="h-3 w-3" />
            </Link>
            <div className="text-text-3">
              <span className="font-bold text-foreground">3 Live</span> · 7 in your package
            </div>
          </div>
        </div>

        {/* Readiness multi-segment bar */}
        <div className="mt-6">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-3">
            Gateway readiness
          </div>
          <div className="flex h-2.5 w-full overflow-hidden rounded-full">
            <span className="h-full bg-emerald-500" style={{ width: "25%" }} />
            <span className="h-full bg-sky-500" style={{ width: "12%" }} />
            <span className="h-full bg-amber-500" style={{ width: "28%" }} />
            <span className="h-full bg-violet-500" style={{ width: "20%" }} />
            <span className="h-full bg-rose-500" style={{ width: "15%" }} />
          </div>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-text-2">
            <Legend dot="bg-emerald-500" label="Completed" count={2} />
            <Legend dot="bg-sky-500" label="Active" count={1} />
            <Legend dot="bg-amber-500" label="Pending" count={2} />
            <Legend dot="bg-violet-500" label="Pending Review" count={1} />
            <Legend dot="bg-rose-500" label="Action Required" count={1} />
          </div>
        </div>

        {/* Primary gateways row */}
        <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {data.primaryGateways.map((g, i) => (
            <div key={g.key} className="relative">
              <div className="rounded-2xl border border-border bg-bg-2/40 p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-soft">
                <div className="text-[10px] font-bold uppercase tracking-wider text-text-3">
                  0{i + 1}
                </div>
                <div className="my-3 flex justify-center">
                  <GatewayLogo gateway={g.key} />
                </div>
                <div className="text-sm font-bold text-foreground">{g.name}</div>
                <div className="mt-2 flex justify-center">
                  <StatusPill status={g.status} />
                </div>
              </div>
              {i < data.primaryGateways.length - 1 && (
                <ArrowRight className="absolute -end-3 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-text-3 lg:block" />
              )}
            </div>
          ))}
        </div>

        {/* Banking & optional */}
        <div className="mt-8">
          <div className="mb-3 text-xs font-semibold text-text-2">
            Banking & optional gateways
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {data.bankingGateways.map((g) => (
              <div
                key={g.key}
                className="flex items-center gap-3 rounded-xl border border-border bg-bg-2/40 p-3"
              >
                <GatewayLogo
                  gateway={g.key}
                  size="sm"
                  muted={g.status === "not_included"}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-bold text-foreground">{g.name}</div>
                  <div className="mt-1">
                    <StatusPill status={g.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-xs text-text-3">
          <div className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            All gateway connections are encrypted and monitored 24/7.
          </div>
          <Link to="/dashboard/support" className="font-semibold text-primary hover:underline">
            Need help? Message support →
          </Link>
        </div>
      </Card>
    </div>
  );
}

function SummaryCard({
  to, icon: Icon, title, status, children,
}: {
  to: string;
  icon: typeof FileText;
  title: string;
  status: Parameters<typeof StatusPill>[0]["status"];
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="group block rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elegant"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="inline-flex items-center gap-2 text-text-2">
          <Icon className="h-4 w-4" />
          <span className="text-sm font-bold text-foreground">{title}</span>
        </div>
        <StatusPill status={status} />
      </div>
      <div className="mt-4 space-y-1.5">{children}</div>
    </Link>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-text-3">{label}</span>
      <span className={`font-semibold text-foreground ${mono ? "font-mono tracking-tight" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function Footer({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[11px] text-text-3">
      <span>{children}</span>
      <ChevronRight className="h-3.5 w-3.5" />
    </div>
  );
}

function Legend({ dot, label, count }: { dot: string; label: string; count: number }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label} <span className="font-bold text-foreground">{count}</span>
    </span>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <div className="flex flex-col items-center px-4 py-10 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Building2 className="h-8 w-8" />
          </div>
          <h2 className="mt-5 text-2xl font-black tracking-tight text-foreground">
            Start your U.S. company
          </h2>
          <p className="mt-3 max-w-md text-sm text-text-2">
            You haven't placed a formation order yet. Pick a package and we'll handle filing,
            EIN, banking, and payment gateways end-to-end.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/dashboard/start"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elegant"
            >
              <Sparkles className="h-4 w-4" />
              Start your U.S. company
            </Link>
            <Link
              to="/dashboard/support"
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-text-2 hover:bg-accent"
            >
              <Headphones className="h-4 w-4" />
              Talk to a specialist
            </Link>
          </div>
          <div className="mt-8 grid w-full gap-3 sm:grid-cols-3">
            <Hint icon={FileText} label="Filing & EIN" />
            <Hint icon={Globe} label="Domain & website" />
            <Hint icon={ShieldCheck} label="Banking & gateways" />
          </div>
        </div>
      </Card>
    </div>
  );
}

function Hint({ icon: Icon, label }: { icon: typeof FileText; label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-bg-2/40 px-3 py-2.5 text-xs font-semibold text-text-2">
      <Icon className="h-3.5 w-3.5 text-primary" />
      {label}
    </div>
  );
}

// suppress unused
void Lock;

