import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, X, Upload, Check, AlertCircle, Loader2 } from "lucide-react";
import {
  StatusPill, GatewayLogo, Card,
  type GatewayKey, type GatewayStatus,
} from "@/components/dashboard/shared";
import { useDashboardDataCtx } from "@/hooks/DashboardDataContext";

export const Route = createFileRoute("/_authenticated/dashboard/gateways")({
  component: GatewaysPage,
});

type Gateway = { key: GatewayKey; name: string; status: GatewayStatus };

const DETAIL_COPY: Partial<Record<GatewayKey, { needs: string; steps: { state: "done" | "current" | "upcoming"; title: string }[] }>> = {
  stripe: {
    needs: "Live and accepting payments. No action needed.",
    steps: [
      { state: "done", title: "Account created" },
      { state: "done", title: "Identity verified" },
      { state: "done", title: "Bank linked" },
      { state: "done", title: "Live mode enabled" },
    ],
  },
  shopify: {
    needs: "Awaiting product catalog upload from your team.",
    steps: [
      { state: "done", title: "Store provisioned" },
      { state: "current", title: "Catalog import in progress" },
      { state: "upcoming", title: "Payments connected" },
      { state: "upcoming", title: "Store published" },
    ],
  },
  wise: {
    needs: "Wise Business account active for international payouts.",
    steps: [
      { state: "done", title: "Account opened" },
      { state: "done", title: "Verification complete" },
      { state: "done", title: "Multi-currency enabled" },
    ],
  },
  payoneer: {
    needs: "Pending compliance review — typically 3-5 business days.",
    steps: [
      { state: "done", title: "Application submitted" },
      { state: "current", title: "Compliance review" },
      { state: "upcoming", title: "Account activated" },
    ],
  },
  paypal: {
    needs: "PayPal Business is active and receiving payments.",
    steps: [
      { state: "done", title: "Business account created" },
      { state: "done", title: "Domain confirmed" },
      { state: "done", title: "Live" },
    ],
  },
  airwallex: {
    needs: "Upload a recent proof of address for the responsible party.",
    steps: [
      { state: "done", title: "Account created" },
      { state: "current", title: "Proof of address required" },
      { state: "upcoming", title: "Account activated" },
    ],
  },
  mercury: {
    needs: "Application under review by Mercury's onboarding team.",
    steps: [
      { state: "done", title: "Application submitted" },
      { state: "current", title: "Under review" },
      { state: "upcoming", title: "Account opened" },
    ],
  },
};

function GatewaysPage() {
  const data = useDashboardDataCtx();
  const [openGateway, setOpenGateway] = useState<Gateway | null>(null);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground">Payment Gateways</h1>
        <p className="mt-2 max-w-2xl text-sm text-text-2">
          Manage every payment provider in your package. Tap any card to see what's needed and the setup timeline.
        </p>
      </div>

      {/* Readiness bar */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-text-3">
            Gateway readiness
          </div>
          <div className="text-xs text-text-3">
            <span className="font-bold text-foreground">3 Live</span> · 7 in your package
          </div>
        </div>
        <div className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full">
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
      </Card>

      {/* Primary gateways */}
      <div>
        <h2 className="mb-3 text-sm font-bold text-foreground">Primary gateways</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {data.primaryGateways.map((g, i) => (
            <button
              key={g.key}
              onClick={() => setOpenGateway(g)}
              className="group rounded-2xl border border-border bg-card p-5 text-start shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elegant"
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-text-3">
                0{i + 1}
              </div>
              <div className="my-3 flex justify-center">
                <GatewayLogo gateway={g.key} />
              </div>
              <div className="text-center text-sm font-bold text-foreground">{g.name}</div>
              <div className="mt-2 flex justify-center">
                <StatusPill status={g.status} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Banking */}
      <div>
        <h2 className="mb-3 text-sm font-bold text-foreground">Banking & optional gateways</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {data.bankingGateways.map((g) => (
            <button
              key={g.key}
              onClick={() => g.status !== "not_included" && setOpenGateway(g)}
              disabled={g.status === "not_included"}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-start shadow-soft transition-all enabled:hover:-translate-y-0.5 enabled:hover:shadow-elegant disabled:cursor-default"
            >
              <GatewayLogo gateway={g.key} size="sm" muted={g.status === "not_included"} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold text-foreground">{g.name}</div>
                <div className="mt-1">
                  <StatusPill status={g.status} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-text-3">
        <div className="inline-flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          All gateway connections are encrypted and monitored 24/7.
        </div>
      </div>

      {openGateway && (
        <GatewayModal gateway={openGateway} onClose={() => setOpenGateway(null)} />
      )}
    </div>
  );
}

function GatewayModal({ gateway, onClose }: { gateway: Gateway; onClose: () => void }) {
  const detail = DETAIL_COPY[gateway.key];
  const isActionRequired = gateway.status === "action_required";

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-elegant"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <GatewayLogo gateway={gateway.key} />
            <div>
              <div className="text-lg font-black text-foreground">{gateway.name}</div>
              <div className="mt-1">
                <StatusPill status={gateway.status} />
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-text-2 hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {detail && (
          <>
            <div
              className={`mt-5 rounded-xl p-4 text-sm ${
                isActionRequired
                  ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
                  : "bg-bg-2 text-text-2"
              }`}
            >
              <div className="flex gap-2">
                {isActionRequired && <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
                <div>
                  <div className="font-bold">What's needed</div>
                  <p className="mt-0.5">{detail.needs}</p>
                </div>
              </div>
            </div>

            <ol className="mt-5 space-y-4">
              {detail.steps.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <div className="relative">
                    {s.state === "done" ? (
                      <div className="grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-white">
                        <Check className="h-3 w-3" />
                      </div>
                    ) : s.state === "current" ? (
                      <div className="grid h-6 w-6 place-items-center rounded-full bg-amber-500 text-white">
                        <Loader2 className="h-3 w-3 animate-spin" />
                      </div>
                    ) : (
                      <div className="grid h-6 w-6 place-items-center rounded-full border-2 border-border" />
                    )}
                    {i < detail.steps.length - 1 && (
                      <span className="absolute left-1/2 top-6 h-5 w-px -translate-x-1/2 bg-border" />
                    )}
                  </div>
                  <div
                    className={`text-sm font-semibold ${
                      s.state === "upcoming" ? "text-text-3" : "text-foreground"
                    }`}
                  >
                    {s.title}
                  </div>
                </li>
              ))}
            </ol>
          </>
        )}

        {isActionRequired && (
          <div className="mt-5">
            <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-border bg-bg-2/50 p-6 text-center transition-colors hover:border-primary hover:bg-primary/5">
              <Upload className="mx-auto h-6 w-6 text-text-3" />
              <div className="mt-2 text-sm font-bold text-foreground">
                Drop your proof of address here
              </div>
              <div className="mt-1 text-xs text-text-3">
                or click to browse · PDF, PNG, JPG up to 10 MB
              </div>
              <input type="file" className="hidden" />
            </label>
            <button className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90">
              Submit document
            </button>
          </div>
        )}
      </div>
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
