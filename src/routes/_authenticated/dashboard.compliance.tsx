import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useActiveWorkspace } from "@/hooks/useActiveWorkspace";
import { PageHeader, Card } from "@/components/dashboard/shared";
import { CalendarCheck2, AlertCircle, Clock, CheckCircle2, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/compliance")({
  component: CompliancePage,
});

type Event = {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  status: string;
};
type Renewal = {
  id: string;
  type: string;
  due_date: string;
  amount: number | null;
  status: string;
  auto_renew: boolean;
};

function CompliancePage() {
  const { activeId } = useActiveWorkspace();

  const eventsQ = useQuery({
    queryKey: ["compliance", activeId],
    enabled: !!activeId,
    queryFn: async (): Promise<Event[]> => {
      const { data, error } = await supabase
        .from("compliance_events")
        .select("id, title, description, due_date, status")
        .eq("order_id", activeId!)
        .order("due_date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Event[];
    },
  });

  const renewalsQ = useQuery({
    queryKey: ["renewals", activeId],
    enabled: !!activeId,
    queryFn: async (): Promise<Renewal[]> => {
      const { data, error } = await supabase
        .from("renewals")
        .select("id, type, due_date, amount, status, auto_renew")
        .eq("order_id", activeId!)
        .order("due_date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Renewal[];
    },
  });

  const events = eventsQ.data ?? [];
  const renewals = renewalsQ.data ?? [];
  const today = new Date();
  const upcoming = events.filter((e) => new Date(e.due_date) >= today && e.status !== "completed");
  const overdue = events.filter((e) => new Date(e.due_date) < today && e.status !== "completed");
  const completed = events.filter((e) => e.status === "completed");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={<><CalendarCheck2 className="h-3 w-3" /> Compliance Calendar</>}
        title="Filings & deadlines"
        description="Stay ahead of annual reports, franchise tax, BOI, and renewal obligations."
      />

      {overdue.length > 0 && (
        <EventSection title="Overdue" icon={<AlertCircle className="h-4 w-4 text-rose-500" />} events={overdue} accent="bg-rose-500/10 text-rose-600" />
      )}
      <EventSection title="Upcoming" icon={<Clock className="h-4 w-4 text-amber-500" />} events={upcoming} accent="bg-amber-500/10 text-amber-600" />
      <EventSection title="Completed" icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />} events={completed} accent="bg-emerald-500/10 text-emerald-600" />

      {events.length === 0 && (
        <Card className="p-8 text-center text-sm text-text-3">
          No compliance events scheduled. We'll add filings after your LLC is approved.
        </Card>
      )}

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-text-3">
          <RefreshCw className="h-4 w-4 text-primary" /> Renewals ({renewals.length})
        </h2>
        {renewals.length === 0 ? (
          <Card className="p-6 text-center text-sm text-text-3">No renewals tracked yet.</Card>
        ) : (
          <div className="space-y-2">
            {renewals.map((r) => (
              <Card key={r.id} className="flex items-center gap-4 !p-4 transition-transform hover:-translate-y-px">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <RefreshCw className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold capitalize text-foreground">{r.type.replace(/_/g, " ")}</div>
                  <div className="text-[11px] text-text-3">
                    Due {new Date(r.due_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    {r.auto_renew && " · Auto-renew on"}
                  </div>
                </div>
                {r.amount != null && (
                  <div className="text-sm font-bold text-foreground">${Number(r.amount).toLocaleString()}</div>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EventSection({ title, icon, events, accent }: { title: string; icon: React.ReactNode; events: Event[]; accent: string }) {
  if (events.length === 0) return null;
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-text-3">
        {icon} {title} <span className="text-text-3">({events.length})</span>
      </h2>
      <div className="space-y-2">
        {events.map((e) => (
          <Card key={e.id} className="flex items-center gap-4 !p-4 transition-transform hover:-translate-y-px">
            <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${accent}`}>
              <CalendarCheck2 className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold text-foreground">{e.title}</div>
              <div className="text-[11px] text-text-3">
                {new Date(e.due_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                {e.description ? ` · ${e.description}` : ""}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
