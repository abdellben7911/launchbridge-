import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageSquare, Download, Check, Loader2, Circle, Info, FileText, Lock, Building2, Sparkles } from "lucide-react";
import { StatusPill, ProgressBar, Card } from "@/components/dashboard/shared";
import { useDashboardDataCtx } from "@/hooks/DashboardDataContext";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/dashboard/ein")({
  component: EinPage,
});

function EinPage() {
  const data = useDashboardDataCtx();

  // No order placed yet → empty state
  if (!data.hasOrder) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card>
          <div className="flex flex-col items-center px-4 py-12 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
              <FileText className="h-8 w-8" />
            </div>
            <h2 className="mt-5 text-2xl font-black tracking-tight text-foreground">
              EIN / Federal Number
            </h2>
            <p className="mt-3 max-w-md text-sm text-text-2">
              Your EIN (Employer Identification Number) will appear here once you've placed a
              formation order. It's required to open U.S. bank accounts and activate Stripe,
              PayPal, and most payment gateways.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/dashboard/start"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-soft transition-all hover:-translate-y-0.5"
              >
                <Sparkles className="h-4 w-4" />
                Start your U.S. company
              </Link>
              <Link
                to="/dashboard/support"
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-text-2 hover:bg-accent"
              >
                <MessageSquare className="h-4 w-4" />
                Talk to a specialist
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const { company, order, documents } = data as typeof data & { order: NonNullable<typeof data["order"]> };
  const einDocs = documents.filter((d) => d.type === "ein_letter" || d.type === "formation");

  // Build dynamic timeline from order timestamps
  const steps = buildSteps(order);
  const einDownloadable = !!order.ein_received_at && einDocs.some((d) => d.type === "ein_letter" && d.status === "approved");

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-text-3">
            # Federal Tax ID
          </div>
          <div className="mt-2 flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              EIN / Federal Number
            </h1>
            <StatusPill status={company.einStatus} />
          </div>
          <p className="mt-2 max-w-2xl text-sm text-text-2">
            {order.ein_received_at
              ? "Your EIN has been issued by the IRS. Download your CP-575 letter below."
              : order.filed_at
              ? "Your SS-4 application has been submitted to the IRS. Processing typically takes 7–14 business days."
              : "Your formation is being prepared. We will file with the IRS as soon as your LLC is registered."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/dashboard/support"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
          >
            <MessageSquare className="h-4 w-4" /> Message specialist
          </Link>
          {einDownloadable ? (
            <EinDownloadButton docs={einDocs} />
          ) : (
            <button
              disabled
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-text-3 opacity-60"
            >
              <Lock className="h-4 w-4" /> Download CP-575
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* LEFT */}
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2">
                <div className="grid h-7 w-7 place-items-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-500/15">
                  {order.ein_received_at ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}
                </div>
                <span className="text-base font-bold text-foreground">Filing progress</span>
              </div>
              {order.filed_at && (
                <span className="text-xs text-text-3">
                  Filed {fmtDate(order.filed_at)}
                </span>
              )}
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-text-2">IRS processing</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {company.einProgress}%
                </span>
              </div>
              <ProgressBar value={company.einProgress} tone="amber" />
            </div>

            <ol className="mt-7 space-y-5">
              {steps.map((s, i) => (
                <li key={i} className="flex gap-4">
                  <div className="relative">
                    <StepIcon state={s.state} />
                    {i < steps.length - 1 && (
                      <span className="absolute left-1/2 top-7 h-7 w-px -translate-x-1/2 bg-border" />
                    )}
                  </div>
                  <div className="flex-1 pb-1">
                    <div className={`text-sm font-bold ${s.state === "upcoming" ? "text-text-3" : "text-foreground"}`}>
                      {s.title}
                    </div>
                    <div className="mt-0.5 text-xs text-text-3">{s.date}</div>
                  </div>
                </li>
              ))}
            </ol>
          </Card>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 dark:border-amber-500/30 dark:bg-amber-500/10">
            <div className="flex gap-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-sm text-text-2">
                <span className="font-bold text-foreground">What is an EIN?</span> Your Employer
                Identification Number is your company's federal tax ID — required to open U.S.
                business bank accounts and activate Stripe, PayPal, and most payment gateways. No
                action is needed from you while the IRS processes it.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-5">
          <Card>
            <div className="inline-flex items-center gap-2">
              <Building2 className="h-4 w-4 text-text-2" />
              <span className="text-base font-bold text-foreground">Registration details</span>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <Field label="Legal entity" value={company.legalEntity} />
              <Field label="Entity type" value={company.entityType} />
              <Field label="State" value={company.state} />
              <Field label="Formation date" value={company.formationDate} />
              <Field label="Responsible party" value={company.responsibleParty} />
              <Field label="Federal EIN" value={order.ein_received_at ? company.federalEin : "Pending"} mono={!!order.ein_received_at} />
            </dl>
          </Card>

          <Card>
            <div className="inline-flex items-center gap-2">
              <FileText className="h-4 w-4 text-text-2" />
              <span className="text-base font-bold text-foreground">Documents</span>
            </div>
            <div className="mt-4 space-y-2">
              {/* CP-575 EIN letter */}
              {(() => {
                const cp = einDocs.find((d) => d.type === "ein_letter");
                return (
                  <DocRow
                    name="CP-575 EIN letter"
                    status={cp?.status === "approved" ? "available" : "locked"}
                    filePath={cp?.file_path ?? null}
                  />
                );
              })()}
              {/* Articles of organization */}
              {(() => {
                const art = documents.find((d) => d.type === "formation");
                return (
                  <DocRow
                    name="Articles of organization"
                    status={art?.status === "approved" ? "available" : art ? "pending" : "locked"}
                    filePath={art?.file_path ?? null}
                  />
                );
              })()}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ── helpers ── */

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function buildSteps(order: { submitted_at: string | null; filed_at: string | null; ein_received_at: string | null }) {
  const done = (title: string, date: string) => ({ state: "done" as const, title, date });
  const current = (title: string, date: string) => ({ state: "current" as const, title, date });
  const upcoming = (title: string, date: string) => ({ state: "upcoming" as const, title, date });

  const steps = [];

  // Step 1 — preparation
  if (order.submitted_at) {
    steps.push(done("Application prepared & reviewed", fmtDate(order.submitted_at)));
  } else {
    steps.push(current("Preparing your application", "In progress"));
  }

  // Step 2 — filed with IRS
  if (order.filed_at) {
    steps.push(done("Submitted to the IRS (SS-4)", fmtDate(order.filed_at)));
  } else if (order.submitted_at) {
    steps.push(current("Submitting to the IRS (SS-4)", "Being filed shortly"));
  } else {
    steps.push(upcoming("Submit to the IRS (SS-4)", "Awaiting LLC registration"));
  }

  // Step 3 — processing
  if (order.ein_received_at) {
    steps.push(done("IRS processing complete", fmtDate(order.ein_received_at)));
  } else if (order.filed_at) {
    const filed = new Date(order.filed_at);
    const eta = new Date(filed);
    eta.setDate(eta.getDate() + 14);
    steps.push(current("IRS processing", `In progress · ETA ~${fmtDate(eta.toISOString())}`));
  } else {
    steps.push(upcoming("IRS processing", "Typically 7–14 business days"));
  }

  // Step 4 — EIN issued
  if (order.ein_received_at) {
    steps.push(done("EIN issued", fmtDate(order.ein_received_at)));
  } else {
    steps.push(upcoming("EIN issued", "Your federal number appears here"));
  }

  // Step 5 — CP-575
  steps.push(
    order.ein_received_at
      ? done("CP-575 confirmation letter", "Available for download")
      : upcoming("CP-575 confirmation letter", "Official PDF becomes downloadable"),
  );

  return steps;
}

function EinDownloadButton({ docs }: { docs: { file_path: string | null; type: string }[] }) {
  const [loading, setLoading] = useState(false);
  const cp = docs.find((d) => d.type === "ein_letter" && d.file_path);

  const handleDownload = async () => {
    if (!cp?.file_path) return;
    setLoading(true);
    const { data } = await supabase.storage.from("documents").createSignedUrl(cp.file_path, 120);
    setLoading(false);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      Download CP-575
    </button>
  );
}

function StepIcon({ state }: { state: "done" | "current" | "upcoming" }) {
  if (state === "done") {
    return (
      <div className="grid h-7 w-7 place-items-center rounded-full bg-emerald-500 text-white">
        <Check className="h-4 w-4" />
      </div>
    );
  }
  if (state === "current") {
    return (
      <div className="grid h-7 w-7 place-items-center rounded-full bg-amber-500 text-white">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }
  return (
    <div className="grid h-7 w-7 place-items-center rounded-full border-2 border-border text-text-3">
      <Circle className="h-2 w-2" />
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="shrink-0 text-text-3">{label}</dt>
      <dd className={`truncate text-right font-semibold text-foreground ${mono ? "font-mono tracking-tight" : ""}`}>
        {value}
      </dd>
    </div>
  );
}

function DocRow({ name, status, filePath }: { name: string; status: "locked" | "available" | "pending"; filePath: string | null }) {
  const [loading, setLoading] = useState(false);

  const handleOpen = async () => {
    if (!filePath) return;
    setLoading(true);
    const { data } = await supabase.storage.from("documents").createSignedUrl(filePath, 120);
    setLoading(false);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  const statusLabel = status === "available" ? "Available" : status === "pending" ? "Pending" : "Locked";
  const statusStyle =
    status === "available"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
      : status === "pending"
      ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
      : "bg-gray-100 text-gray-500 dark:bg-gray-500/20 dark:text-gray-400";

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-bg-2/40 px-3 py-2.5 text-sm">
      <div className="inline-flex items-center gap-2 text-foreground">
        {status === "locked" ? (
          <Lock className="h-3.5 w-3.5 text-text-3" />
        ) : (
          <FileText className="h-3.5 w-3.5 text-primary" />
        )}
        {name}
      </div>
      {status === "available" ? (
        <button
          onClick={handleOpen}
          disabled={loading}
          className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusStyle} hover:opacity-80`}
        >
          {loading ? "…" : statusLabel}
        </button>
      ) : (
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusStyle}`}>
          {statusLabel}
        </span>
      )}
    </div>
  );
}
