import { createFileRoute } from "@tanstack/react-router";
import {
  Headphones, MessageSquare, Mail, Calendar, Bell, AlertCircle, Check, ChevronRight, HelpCircle,
} from "lucide-react";
import { StatusPill, Card } from "@/components/dashboard/shared";
import { useDashboardDataCtx } from "@/hooks/DashboardDataContext";

export const Route = createFileRoute("/_authenticated/dashboard/support")({
  component: SupportPage,
});

const QUICK_HELP = [
  "When will my EIN be ready?",
  "How do I activate a new gateway?",
  "Where are my login credentials?",
  "How is my data kept secure?",
];

function SupportPage() {
  const data = useDashboardDataCtx();
  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-text-3">
          <Headphones className="h-3.5 w-3.5" /> Help Center
        </div>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-3xl font-black tracking-tight text-foreground">Support</h1>
          <StatusPill status="online" />
        </div>
        <p className="mt-2 max-w-2xl text-sm text-text-2">
          Your dedicated specialist is here to help — so you never need to chase updates over WhatsApp again.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* LEFT */}
        <div className="space-y-5 lg:col-span-2">
          {/* Specialist */}
          <Card>
            <div className="inline-flex items-center gap-2">
              <Headphones className="h-4 w-4 text-text-2" />
              <span className="text-base font-bold text-foreground">Your specialist</span>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-base font-black text-primary-foreground">
                {data.specialist.initials}
              </div>
              <div>
                <div className="text-base font-bold text-foreground">{data.specialist.name}</div>
                <div className="mt-1 inline-flex items-center gap-1.5 text-xs text-text-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Online · {data.specialist.role}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                <MessageSquare className="h-4 w-4" /> Message
              </button>
              <button className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent">
                <Mail className="h-4 w-4" /> Email
              </button>
              <button className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent">
                <Calendar className="h-4 w-4" /> Schedule call
              </button>
            </div>
          </Card>

          {/* Updates */}
          <Card>
            <div className="inline-flex items-center gap-2">
              <Bell className="h-4 w-4 text-text-2" />
              <span className="text-base font-bold text-foreground">Recent updates</span>
            </div>
            <ol className="mt-5 space-y-5">
              {data.updates.map((u, i) => (
                <li key={i} className="flex gap-3">
                  <div className="relative">
                    {u.kind === "alert" ? (
                      <div className="grid h-7 w-7 place-items-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/15">
                        <AlertCircle className="h-3.5 w-3.5" />
                      </div>
                    ) : (
                      <div className="grid h-7 w-7 place-items-center rounded-full bg-emerald-500 text-white">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                    )}
                    {i < data.updates.length - 1 && (
                      <span className="absolute left-1/2 top-7 h-5 w-px -translate-x-1/2 bg-border" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-foreground">{u.title}</div>
                    <div className="mt-0.5 text-xs text-text-3">{u.date}</div>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        {/* RIGHT */}
        <div className="space-y-5">
          <Card>
            <div className="inline-flex items-center gap-2">
              <Headphones className="h-4 w-4 text-text-2" />
              <span className="text-base font-bold text-foreground">Support details</span>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <Field label="Avg response" value="Under 2 hours" />
              <Field label="Hours" value="Mon-Fri · 9am-7pm ET" />
              <Field label="Channels" value="Chat · Email · Call" />
              <Field label="Account manager" value={data.specialist.name} />
            </dl>
          </Card>

          <Card>
            <div className="inline-flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-text-2" />
              <span className="text-base font-bold text-foreground">Quick help</span>
            </div>
            <ul className="mt-3 divide-y divide-border">
              {QUICK_HELP.map((q) => (
                <li key={q}>
                  <button className="flex w-full items-center justify-between gap-2 py-2.5 text-start text-sm text-text-2 hover:text-primary">
                    {q}
                    <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-text-3">{label}</dt>
      <dd className="font-semibold text-foreground">{value}</dd>
    </div>
  );
}
