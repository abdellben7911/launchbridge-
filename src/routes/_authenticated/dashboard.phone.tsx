import { createFileRoute } from "@tanstack/react-router";
import { Phone, Copy } from "lucide-react";
import { StatusPill, Card } from "@/components/dashboard/shared";
import { useDashboardData } from "@/hooks/useDashboardData";

export const Route = createFileRoute("/_authenticated/dashboard/phone")({
  component: PhonePage,
});

function PhonePage() {
  const data = useDashboardData();
  return (
    <div className="mx-auto max-w-4xl">
      <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-text-3">
        <Phone className="h-3.5 w-3.5" /> U.S. Communication
      </div>
      <div className="mt-2 flex items-center gap-3">
        <h1 className="text-3xl font-black tracking-tight text-foreground">U.S. Phone</h1>
        <StatusPill status="active" />
      </div>
      <p className="mt-2 max-w-2xl text-sm text-text-2">
        Your dedicated U.S. phone number, login credentials, and app access for staying reachable wherever you are.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <Card>
          <div className="text-sm font-bold text-foreground">Phone number</div>
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-bg-2 p-3">
            <span className="flex-1 font-mono text-lg font-bold text-foreground">
              {data.services.phoneNumber}
            </span>
            <button className="grid h-8 w-8 place-items-center rounded-lg text-text-2 hover:bg-accent">
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 text-xs text-text-3">
            Forwards to your WhatsApp by default · Toll-free fallback included.
          </div>
        </Card>

        <Card>
          <div className="text-sm font-bold text-foreground">Login email</div>
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-bg-2 p-3">
            <span className="flex-1 font-mono text-sm font-bold text-foreground">
              {data.services.loginEmail}
            </span>
            <button className="grid h-8 w-8 place-items-center rounded-lg text-text-2 hover:bg-accent">
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 text-xs text-text-3">
            Use this email for the U.S. carrier app · Password sent via secure message.
          </div>
        </Card>
      </div>
    </div>
  );
}
