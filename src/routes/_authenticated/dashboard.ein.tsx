import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare, Download, Check, Loader2, Circle, Info, FileText, Lock } from "lucide-react";
import { StatusPill, ProgressBar, Card } from "@/components/dashboard/shared";
import { useDashboardData } from "@/hooks/useDashboardData";

export const Route = createFileRoute("/_authenticated/dashboard/ein")({
  component: EinPage,
});

const STEPS = [
  { state: "done", title: "Application prepared & reviewed", date: "May 16, 2025" },
  { state: "done", title: "Submitted to the IRS (SS-4)", date: "May 18, 2025" },
  { state: "current", title: "IRS processing", date: "In progress · typically 7-14 business days" },
  { state: "upcoming", title: "EIN issued", date: "Your federal number appears here" },
  { state: "upcoming", title: "CP-575 confirmation letter", date: "Official PDF becomes downloadable" },
] as const;

function EinPage() {
  const data = useDashboardData();
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
            <StatusPill status="pending" />
          </div>
          <p className="mt-2 max-w-2xl text-sm text-text-2">
            Your Employer Identification Number is being issued by the IRS. We will notify you the moment it is approved.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent">
            <MessageSquare className="h-4 w-4" /> Message specialist
          </button>
          <button
            disabled
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-text-3 opacity-60"
          >
            <Lock className="h-4 w-4" /> Download CP-575
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* LEFT — Filing progress + callout */}
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2">
                <div className="grid h-7 w-7 place-items-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-500/15">
                  <Loader2 className="h-3.5 w-3.5" />
                </div>
                <span className="text-base font-bold text-foreground">Filing progress</span>
              </div>
              <span className="text-xs text-text-3">Updated May 20</span>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-text-2">IRS processing</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {data.company.einProgress}%
                </span>
              </div>
              <ProgressBar value={data.company.einProgress} tone="amber" />
            </div>

            {/* Timeline */}
            <ol className="mt-7 space-y-5">
              {STEPS.map((s, i) => (
                <li key={i} className="flex gap-4">
                  <div className="relative">
                    <StepIcon state={s.state} />
                    {i < STEPS.length - 1 && (
                      <span className="absolute left-1/2 top-7 h-7 w-px -translate-x-1/2 bg-border" />
                    )}
                  </div>
                  <div className="flex-1 pb-1">
                    <div
                      className={`text-sm font-bold ${
                        s.state === "upcoming" ? "text-text-3" : "text-foreground"
                      }`}
                    >
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
              <div className="text-sm text-text-2">
                <span className="font-bold text-foreground">What is an EIN?</span> An Employer
                Identification Number is your company's federal tax ID — required to open U.S.
                business bank accounts and activate most payment gateways. No action is needed
                from you while the IRS processes it.
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — Registration + documents */}
        <div className="space-y-5">
          <Card>
            <div className="inline-flex items-center gap-2">
              <FileText className="h-4 w-4 text-text-2" />
              <span className="text-base font-bold text-foreground">Registration details</span>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <Field label="Legal entity" value={data.company.legalEntity} />
              <Field label="Entity type" value={data.company.entityType} />
              <Field label="State" value={data.company.state} />
              <Field label="Formation date" value={data.company.formationDate} />
              <Field label="Responsible party" value={data.company.responsibleParty} />
              <Field label="Federal EIN" value={data.company.federalEin} mono />
            </dl>
          </Card>

          <Card>
            <div className="inline-flex items-center gap-2">
              <FileText className="h-4 w-4 text-text-2" />
              <span className="text-base font-bold text-foreground">Documents</span>
            </div>
            <div className="mt-4 space-y-2">
              <DocRow name="CP-575 EIN letter" status="locked" />
              <DocRow name="Articles of organization" status="available" />
            </div>
          </Card>
        </div>
      </div>
    </div>
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
      <dt className="text-text-3">{label}</dt>
      <dd className={`font-semibold text-foreground ${mono ? "font-mono tracking-tight" : ""}`}>
        {value}
      </dd>
    </div>
  );
}

function DocRow({ name, status }: { name: string; status: "locked" | "available" }) {
  const Icon = status === "locked" ? Lock : Download;
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-bg-2/40 px-3 py-2.5 text-sm">
      <div className="inline-flex items-center gap-2 text-foreground">
        <Icon className="h-3.5 w-3.5 text-text-3" />
        {name}
      </div>
      <StatusPill status={status} />
    </div>
  );
}
