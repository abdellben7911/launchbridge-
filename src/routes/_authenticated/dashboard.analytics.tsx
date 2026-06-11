import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useActiveWorkspace } from "@/hooks/useActiveWorkspace";
import { PageHeader, Card, KpiCard } from "@/components/dashboard/shared";
import { BarChart3, DollarSign, FileText, GraduationCap, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { user } = useAuth();
  const { activeId } = useActiveWorkspace();

  const invoicesQ = useQuery({
    queryKey: ["invoices", activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("id, amount, currency, status, created_at")
        .eq("order_id", activeId!);
      if (error) throw error;
      return data ?? [];
    },
  });

  const docsQ = useQuery({
    queryKey: ["doc-count", activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("documents")
        .select("id", { count: "exact", head: true })
        .eq("order_id", activeId!);
      if (error) throw error;
      return count ?? 0;
    },
  });

  const coursesQ = useQuery({
    queryKey: ["courses", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_enrollments")
        .select("id, course_slug, progress_pct")
        .eq("client_id", user!.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  const accountsQ = useQuery({
    queryKey: ["bank-balance", activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banking_accounts")
        .select("balance_usd")
        .eq("order_id", activeId!);
      if (error) throw error;
      return data ?? [];
    },
  });

  const totalInvoiced = (invoicesQ.data ?? []).reduce((s, i) => s + Number(i.amount), 0);
  const paidInvoices = (invoicesQ.data ?? []).filter((i) => i.status === "paid").length;
  const totalBalance = (accountsQ.data ?? []).reduce((s, a) => s + Number(a.balance_usd ?? 0), 0);
  const courseAvg = coursesQ.data?.length
    ? Math.round(coursesQ.data.reduce((s, c) => s + Number(c.progress_pct), 0) / coursesQ.data.length)
    : 0;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={<><BarChart3 className="h-3 w-3" /> Analytics</>}
        title="Workspace performance"
        description="Revenue, documents, banking, and academy progress at a glance."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Invoiced" value={`$${totalInvoiced.toLocaleString()}`} hint={`${paidInvoices} paid`} trend="up" />
        <KpiCard label="Bank Balance" value={`$${totalBalance.toLocaleString()}`} hint="All accounts" />
        <KpiCard label="Documents" value={String(docsQ.data ?? 0)} hint="In your vault" />
        <KpiCard label="Course Progress" value={`${courseAvg}%`} hint={`${coursesQ.data?.length ?? 0} enrolled`} trend={courseAvg > 50 ? "up" : "flat"} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-text-3">Recent invoices</h2>
          </div>
          {(invoicesQ.data ?? []).length === 0 ? (
            <div className="py-6 text-center text-xs text-text-3">No invoices yet.</div>
          ) : (
            <ul className="divide-y divide-border">
              {(invoicesQ.data ?? []).slice(0, 6).map((i) => (
                <li key={i.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-text-2">
                    {new Date(i.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  <span className="font-semibold text-foreground">${Number(i.amount).toLocaleString()} {i.currency}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    i.status === "paid" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                  }`}>{i.status}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="mb-3 flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-text-3">Academy progress</h2>
          </div>
          {(coursesQ.data ?? []).length === 0 ? (
            <div className="py-6 text-center text-xs text-text-3">Enroll in a course to start tracking progress.</div>
          ) : (
            <div className="space-y-3">
              {(coursesQ.data ?? []).map((c) => (
                <div key={c.id}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-semibold capitalize text-foreground">{c.course_slug.replace(/-/g, " ")}</span>
                    <span className="text-text-3">{c.progress_pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-bg-2">
                    <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all" style={{ width: `${c.progress_pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Insights</h3>
            <p className="mt-1 text-sm text-text-2">
              {totalInvoiced > 0
                ? `You've invoiced $${totalInvoiced.toLocaleString()} so far. ${paidInvoices > 0 ? "Keep building." : "Follow up on outstanding invoices to improve cash flow."}`
                : "Start tracking revenue by issuing your first invoice from the Banking hub."}
            </p>
          </div>
          <FileText className="ms-auto h-4 w-4 text-text-3" />
        </div>
      </Card>
    </div>
  );
}
